const { hash, compare } = require("bcryptjs");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class UserController {
  async create(request, response) {
    const { name, email, password } = request.body;
    const database = await sqliteConnection();
    const checkUserExists = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (checkUserExists) {
      throw new AppError("este usuário já está registrado");
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;
    const database = await sqliteConnection();

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este email já está em uso!");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha"
      );
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere");
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `UPDATE USERS SET name = ?, email = ?, password = ?, updated_at = DATETIME('NOW') WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );

    return response.json();
  }

  async fetch(request, response) {
    const { user_id } = request.params;
    const database = await sqliteConnection();
    const fetchUser = await database.get("SELECT id, name, email, created_at, updated_at FROM users WHERE id = (?)", [
      user_id,
    ]);

    if (!fetchUser) {
      throw new AppError("Usuário inexistente");
    }

    return response
      .json(fetchUser)

      .catch((err) => {
        console.error(res);
        return response.json(err)
      });
  }
}
module.exports = UserController;

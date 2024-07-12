const { hash, compare } = require("bcryptjs")

const knex = require("../database/knex")

const AppError = require("../utils/AppError")

class UsersController {
   async create(req, res) {
      const { name, email, password, avatar } = req.body

      const checkUserExists = await knex("users")
         .where("email", email).first()
         
      if(checkUserExists) {
         throw new AppError("This email is already in use.")
      }

      const hashedPassword = await hash(password, 8)

      await knex("users").insert({
         name,
         email,
         password: hashedPassword,
         avatar
      })

      return res.status(201).json()
   }

   async update(req, res) {
      const { name, email, old_password, new_password } = req.body
      const user_id = req.user.id

      const userExists = await knex("users").where("id", user_id).first()

      if(!userExists) {
         throw new AppError("User not found!")
      }

      const emailExists = await knex("users").where({ email }).first()

      const emailUser = await knex("users")
         .where("id", user_id)
         .andWhere({ email })
         .select("email")

      if(emailExists && !emailUser) {
         throw new AppError("This email is already in use.")
      }

      if(email === "" || name === "") {
         throw new AppError("The fields must be filled in!")
      }

      if(!old_password && new_password) {
         throw new AppError("You need to enter old password to change your password.")
      }

      if(old_password && new_password) {
         const validUserPassword = await knex
            .select("password", "name")
            .from("users")
            .where("id", user_id)

         const matchCurrentPasswordWithNewPassword = 
            await compare(old_password, validUserPassword[0].password)

         if(!matchCurrentPasswordWithNewPassword) {
            throw new AppError("You need to enter a old_password correctly.")
         }

         const newHashedPassword = await hash(new_password, 8)
         

         await knex("users").where("id", user_id).update({
            password: newHashedPassword
         })
      }

      await knex("users").where("id", user_id).update({
         name,
         email
      })

      await knex("users")
      .update({
      updated_at: knex.fn.now()
      })
      .where("id", user_id);

      return res.json()
   }

   async delete(req, res) {
      const { id } = req.params
      const user_id = req.user.id

      const validUser = await knex("users")
         .where("id", user_id)
         .select("id")

      if(validUser[0].id == id) {
         await knex("users").where({ id }).delete()
      } else {
         throw new AppError("Only user admin can delete own profile!")
      }
   
      return res.json()
   }
}

module.exports = UsersController


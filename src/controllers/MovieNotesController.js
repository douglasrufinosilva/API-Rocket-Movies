const knex = require("../database/knex")
const AppError = require("../utils/AppError")

class MovieNotesController {
   async create(req, res) {
      const { username, title, description, rating, tags } = req.body
      const user_id = req.user.id

      const validUser = await knex("users")
         .where("id", user_id)
         .andWhere("name", username)

      if(validUser.length === 0) {
         throw new AppError("User not found, unable to create note!")
      }

      if(rating < 0 || rating > 5) {
         throw new AppError("Rating must be between 0 and 5")
      }


      const [note_id] = await knex("movie_notes").insert({
         title,
         description,
         rating,
         user_id
      })

      const allTags = tags.map(tag => {
         return {
            note_id,
            user_id,
            name: tag
         }
      })

      if(tags.length > 0) {
         await knex("movie_tags").insert(allTags)
      }

      return res.json()
   }

   async index(req, res) {
      const user_id = req.user.id
      const { title } = req.query

      const notes = await knex('movie_notes')
         .where({ user_id })
         .whereLike('title', `%${title}%`)
         .select('id', 'title', 'description', 'rating')

      const tags = await knex('movie_tags')
         .orderBy('name')
         .select('name', 'note_id')
      const tagsWithNotes = notes.map(note => {
         const notesTags = tags.filter(tag => tag.note_id === note.id)

         return {
            ...note,
            notesTags
         }
      })

      return res.json(tagsWithNotes)
      }

   async show(req, res) {
      const { id } = req.params

      const note = await knex("movie_notes").where({id}).first()
      const tag = await knex("movie_tags")
         .where("note_id", id)

      return res.json({
         ...note,
         tag
      })
   } 

   async delete(req, res) {
      const { id } = req.params
      const user_id = req.user.id

      const validNoteAdmin = await knex("movie_notes")
            .where({ id })
            .andWhere({ user_id })

      if(validNoteAdmin.length > 0) {
         await knex("movie_notes")
            .where({ id }).delete()
      } else {
         throw new AppError("Only note admin can delete note!")
      }
      
      return res.json()
   }
}

module.exports = MovieNotesController
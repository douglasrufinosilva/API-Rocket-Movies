const knex = require("../database/knex")

class MovieTagsController {
   async index(req, res) {
      const user_id = req.user.id;

      const tags = await knex("movie_tags")
         .where({ user_id })
         .groupBy('name')
         .select('name')

      return res.json(tags)
   }
}

module.exports = MovieTagsController
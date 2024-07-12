const { Router } = require("express")

const usersRouter = require("./users.routes")
const movie_notesRouter = require("./movie_notes.routes")
const movie_tagsRouter = require("./movie_tags.routes")
const sessionsRouter = require("./sessions.routes")

const routes = Router()
routes.use("/users", usersRouter)
routes.use("/notes", movie_notesRouter)
routes.use("/tags", movie_tagsRouter)
routes.use("/sessions", sessionsRouter)

module.exports = routes
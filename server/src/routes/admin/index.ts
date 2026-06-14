import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import postsRouter from './posts'
import servicesRouter from './services'
import categoriesRouter from './categories'
import contactsRouter from './contacts'
import officesRouter from './offices'
import bannersRouter from './banners'
import settingsRouter from './settings'
import statsRouter from './stats'
import usersRouter from './users'
import uploadRouter from './upload'
import menuRouter from './menu'
import testimonialsRouter from './testimonials'
import teamRouter from './team'
import pagesRouter from './pages'
import importRouter from './import'
import trashRouter from './trash'

const router = Router()

// Tất cả admin routes đều yêu cầu xác thực
router.use(authenticate)

router.use('/posts', postsRouter)
router.use('/services', servicesRouter)
router.use('/categories', categoriesRouter)
router.use('/contacts', contactsRouter)
router.use('/offices', officesRouter)
router.use('/banners', bannersRouter)
router.use('/settings', settingsRouter)
router.use('/stats', statsRouter)
router.use('/users', usersRouter)
router.use('/upload', uploadRouter)
router.use('/menu', menuRouter)
router.use('/testimonials', testimonialsRouter)
router.use('/team', teamRouter)
router.use('/pages', pagesRouter)
router.use('/import', importRouter)
router.use('/trash', trashRouter)

export default router

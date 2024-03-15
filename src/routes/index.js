'use strict'

const express = require('express')
const { apiKey,permissions } = require('../auth/checkAuth')
const router = express.Router()

router.use(apiKey)

router.use(permissions('0000'))

router.use('/v1/api',require('./access'))
// router.get('/', (req, res, next)=>{
//     return res.status(200).json({
//         message: 'Welcome quyt',
//     })
// })

module.exports = router
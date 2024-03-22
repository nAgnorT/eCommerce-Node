'use strict'

const express = require('express')
const { apiKey,permissions } = require('../auth/checkAuth')
const router = express.Router()

router.use(apiKey)

router.use(permissions('0000'))

router.use('/v1/api',require('./access'))
router.use('/v1/api/product', require('./product'))


module.exports = router
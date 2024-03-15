'use strict'

const AccessService = require('../services/access.service')
const { CREATED } = require('../core/success.response')

class AccessController{
    signUp = async (req, res, next ) => {
            // return resolveSoa.status(200).json({
            //     message:'',
            //     metadata:
            // }) 
            new CREATED({
                message:'Registered OK!',
                metadata: await AccessService.signUp(req.body),
                options: {
                    limit: 10
                }
            }).send(res)
            // return res.status(201).json(await AccessService.signUp(req.body))
    }
}

module.exports = new AccessController()
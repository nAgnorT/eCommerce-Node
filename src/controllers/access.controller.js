'use strict'

const AccessService = require('../services/access.service')
const { CREATED, SuccessResponse } = require('../core/success.response')

class AccessController{
    logout = async (req,res, next) => {
        new SuccessResponse({
            message: 'Logout Success',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    login = async (req,res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

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
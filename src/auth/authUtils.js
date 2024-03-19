'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')
const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'athorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        //verify
        JWT.verify(accessToken,publicKey,(err, decode) => {
            if(err) {
                console.error(`error verify:`, err)
            } else {
                console.log (`decode verify:`, decode)
            }
        })
        return {accessToken, refreshToken}
    } catch (error) {
        return error
    }
}

const authentication = asyncHandler( async (req,res,next) => {
    /* 
        1 - check userID missing
        2 - get accessToken
        3 - Verify token
        4 - check user in dbs
        5 - check keyStore with userId
        6 - OK All -> return next
    
    */

    //1
   const userId  = req.headers[HEADER.CLIENT_ID]
   if(!userId) throw new AuthFailureError('Invalid request')


   //2
   const keyStore = await findByUserId(userId)
   if(!keyStore) throw new NotFoundError('Not Found keyStore')

   //3
   const accessToken = req.headers[HEADER.AUTHORIZATION]
   if(!accessToken) throw new AuthFailureError('Invalid request')


   //4,5
   try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
        req.keyStore = keyStore
        return next()

   } catch(error){
    
   }
})

module.exports = {
    createTokenPair,
    authentication
}
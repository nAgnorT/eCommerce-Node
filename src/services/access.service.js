'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')
const keytokenModel = require('../models/keytoken.model')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /* 
        Check token used
    
    */
        static handlerRefreshTokenV2 = async ({keyStore,user,refreshToken}) => {

            const {userId, email} = user;

            if(keyStore.refreshTokensUsed.includes(refreshToken)){
                await KeyTokenService. deleteKeyById(userId)
                throw new ForbiddenError('Something wrong happen !! Please relogin')


            }

            if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered! - 1')
            
            const foundShop = await findByEmail({email})
            if(!foundShop) throw new AuthFailureError('Shop not registered! - 2')
    
            const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey)
    
            //update token
    
            await keyStore.updateOne({
                $set: {
                    refreshToken: tokens.refreshToken
                },
                $addToSet: {
                    refreshTokensUsed: refreshToken
                }
            })
            return {
                user,
                tokens
            }
            

        }



    static handleRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokensUsed(refreshToken)
        console.log('ftoken')

        //neu co
        if(foundToken) {
            //decode who
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log(`1 --`, {userId, email})

            //xoa

            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happen !! Please relogin')
            
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken) throw new AuthFailureError('Shop not registered!')

        //verifytoken
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log('2 -- ',{userId, email})

        const foundShop = await findByEmail(email)
        if(!foundShop) throw new AuthFailureError('Shop not registered!')

        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        //update token

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user: {userId, email},
            tokens
        }
    }

    static logout = async(keyStore) =>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }

    /* 
        1 - check email  in dbs
        2 - match password
        3 - create AT & RT and save
        4 - generate tokens
        5 - get data return login
    
    */

    static login = async({email, password, refreshToken = null}) => {

        //1 - check email in dbs
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop is not registered')

        //2 - match password
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Aunthentication Error')

        //3 - create AT & RT and save
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        //4 - generate tokens
        const {_id:userId} = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId
        })
        //5 - get data return login
        return {
                shop: getInfoData({fileds: ['_id', 'name', 'email'], object: foundShop}),
                tokens
        }
    }

    static signUp = async ({name, email, password}) => {
        // try{
            //step 1: check email exists
            const holderShop= await shopModel.findOne({email}).lean()
            if(holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }
            const passwordHash = await bcrypt.hash(password,10)
            const newShop = await shopModel.create({
                name, email, password:passwordHash, roles: [RoleShop.SHOP]
            })

            if(newShop) {
                // created privateKey, publicKey
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })
                //PublicKey CryptoGraphy Standarts
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })
                if (!keyStore){
                    throw new BadRequestError('Error: Shop already registered!')
                }
                //create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                //const token
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }

            }
            return {
                code: 200,
                metadata: null
            }

        // } catch (error){
        //     return{
        //         cose:'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService
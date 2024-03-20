'use strict'


const keytokenModel = require("../models/keytoken.model")
const {ObjectId} =  require('bson')


class KeyTokenService {
    static createKeyToken = async({userId, publicKey, privateKey, refreshToken}) => {
        try {
            //lv 0
            // const tokens = await keytokenModel.create({
            //     user: userId, 
            //     publicKey,
            //     privateKey
            // })
            // return tokens ? publicKeyString : null

            //level xxx
            const filter = {user: userId}, update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = {upsert: true, new:true}

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch(error) {
            return error
        }
    }

    static findByUserId = async(userId) => {
        const _id = new ObjectId(userId)
        const findUser = await keytokenModel.findOne({user: _id})
        return findUser
    }

    static removeKeyById = async(id) => {
        const removeKey = await keytokenModel.deleteOne({
            _id: new ObjectId(id)
        })
        return removeKey
    }

    static findByRefreshTokensUsed = async (refreshToken) => {
        return await keytokenModel.findOne({refreshTokensUsed: refreshToken})
    }
    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({refreshToken}).lean()
    }
    static deleteKeyById = async (userId) => {
        return await keytokenModel.findByIdAndDelete({user: userId})
    }
}

module.exports = KeyTokenService
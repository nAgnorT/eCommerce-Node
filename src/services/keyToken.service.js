'use strict'

const keytokenModel = require("../models/keytoken.model.js")

class KeyTokenService {
    static createKeyToken = async({userId, publicKey, privateKey}) => {
        try {
            // const publicKeyString = publicKey.toString()
            const tokens = await keytokenModel.create({
                user: userId, 
                publicKey,
                privateKey
            })

            return tokens ? publicKeyString : null
        } catch(error) {
            return error
        }
    }
}

module.exports = KeyTokenService
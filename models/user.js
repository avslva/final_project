const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    surname: {
        type: String
    },
    phone: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    appointments: {
        appointmentList: {
            type:[{
                id: {
                    type: String
                },
                serviceName: {
                    type: String
                },
                date: {
                    type: String
                },
                time: {
                    type: String
                }
            }]
        },
        size: {
            type:Number
        }
    }
});

const User = module.exports = mongoose.model('user', UserSchema)
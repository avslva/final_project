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
    appointmentList: {
        appointment: {
            serviceName: {
                type: String
            },
            date: {
                type: String
            },
            time: {
                type: String
            }
        }
    }
});

const User = module.exports = mongoose.model('user', UserSchema)

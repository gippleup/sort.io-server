import { ExpressController } from "./types"

type UserController = {
  signup: ExpressController,
  signin: ExpressController,
  signout: ExpressController,
  delete: ExpressController,
}

const controller: UserController  = {
  signup: (req, res) => {
  },
  signin: (req, res) => {
    
  },
  signout: (req, res) => {

  },
  delete: (req, res) => {

  },
}

export default controller
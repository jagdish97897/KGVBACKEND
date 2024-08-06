import { Router } from "express";
import { loginConsumer, registerConsumer, sendConsumerOtp, login, checkout } from "../controllers/consumer.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/signup").post(registerConsumer)
router.route("/sendOtp").get(sendConsumerOtp)
router.route("/login").post(loginConsumer)
router.route("/loginvisitor").post(login)
router.route("/placeOrder").post(checkout)
// router.route("/bookVehicle").post(bookVehicle);

export default router;
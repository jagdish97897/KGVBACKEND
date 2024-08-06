import { Router } from "express";
import { registerVsp, sendVspOtp, loginVsp, verifyOtp } from "../controllers/vsp.controller.js";



const router = Router()



router.route("/vspsignup").post(registerVsp)
router.route("/vspsendOtp").get(sendVspOtp)
router.route("/vsplogin").post(loginVsp)
router.route("/vspverify").get(verifyOtp)



export default router;
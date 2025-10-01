import { JWTPayload, SignJWT } from "jose"
import { GenerateSecretKey } from "./GenerateSecretKey";
// import jwt from "jsonwebtoken";

export const GenerateJWT = async <T extends JWTPayload>(data : T) =>{
    const JWT_TOKEN = await new SignJWT(data)
    .setProtectedHeader({alg:"HS256"})
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(GenerateSecretKey())
    
    return JWT_TOKEN;
}

// export const GenerateJWT = async (data: object) => {
//     const JWT_TOKEN = jwt.sign(data, process.env.JWT_SECRET_KEY!, {expiresIn: '2h'});
//     return JWT_TOKEN
// }

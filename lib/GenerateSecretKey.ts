export const GenerateSecretKey = () =>{
    return new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
}
import {PrismaClient} from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}
const db= global.prisma?? prismaClientSingleton()

export default db

if (process.env.Node_Env !== "production") globalThis.prisma = db
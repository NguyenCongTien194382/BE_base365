// check IP truy cập admin
exports.checkIP = async(req, res, next) => {
    try {
        console.log("vào check IP")
        var forwardedIpsStr = req.header('x-forwarded-for')
        const IP = forwardedIps = forwardedIpsStr.split(',')[0]
        const public = Number(req.body.public)
        const list_IP = [
            "210.245.75.51",
            "123.24.206.25",
            "118.70.126.231",
            "43.239.223.60",
            "222.252.99.85",
            "171.224.177.118",
            "14.232.208.241"
        ]
        if (public) next()
        else if (list_IP.includes(IP)) next()
        else return res.json({
            err: "Không có quyền"
        })

    } catch (error) {
        console.log("error", error)
        return res.json({ err: "Không được phép truy cập" })
    }
}
export default {
    description: "Rate how-gay user is based on his/her username (plus nickname if used)",
    fn: async (ctx, args) => {
        if (!ctx.guild) {
            return "This is guild only command!";
        }

        let member = ctx.member;
        if (args.length > 0) {
            member = ctx.main.Utils.stringMember(ctx, args.join(" "));
        }

        let value = rate(member.user.username);
        if (member.nickname) {
            value += rate(member.nickname);
        }

        if (member.user.id === "523854355955449896") {
            return "Bruh, Estrol is known female user and ofc she not gay 🤦";
        }

        console.log(value);

        return `${member.nickname ? member.nickname : member.user.username} gay rate is: ${value >= 1000 ? 100 : ((value/100)*100)}% 🏳️‍🌈`;
    }
}

function rate(username) {
    console.log(username)

    if (username.startsWith("!")) {
        return 1000;
    }

    const increase1 = ["1", "3", "7", "9"];
    const increase2 = ["b", "o", "k", "!", "@", "$", "4"];
    const increate3 = ["g", "a", "y"];

    let rate = 0;

    for (const val of increate3) {
        if (username.includes(val)) {
            rate += 15;
        }
    }

    for (const val of increase2) {
        if (username.includes(val)) {
            rate += 10;
        }
    }

    for (const val of increase1) {
        if (username.includes(val)) {
            rate += 5;
        }
    }

    return rate;
}
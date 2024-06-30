const express = require("express");
const { Client } = require("discord.js-selfbot-v13");
const Genders = require("./Genders.json");
class UserController {
  constructor(app, client) {
    this.client = client;
    this.app = app;
    this.routes();
  }

  routes() {
    this.app.route("/api/user").get(this.getUser.bind(this));
  }

  getGender(name) {
    if (!name) {
      return "Belirsiz";
    }

    const lowerCaseNames = name.split(" ").map((name) => name.toLowerCase());

    const genders = Genders.Names.filter((entry) =>
      lowerCaseNames.includes(entry.name.toLowerCase()),
    ).map((entry) => entry.sex);

    if (genders.length === 0) {
      return "Belirsiz";
    }

    if (
      genders[0] === "U" &&
      genders.length === 2 &&
      (genders[1] === "E" || genders[1] === "K")
    ) {
      return genders[1] === "E" ? "Erkek" : "Kadın";
    } else if (genders.every((gender) => gender === "U")) {
      return "Belirsiz";
    } else if (genders.every((gender) => gender === "K")) {
      return "Kadın";
    } else if (genders.every((gender) => gender === "E")) {
      return "Erkek";
    } else {
      return genders[0] === "E" ? "Erkek" : "Kadın";
    }
  }

  isValidName(name) {
    return Genders.Names.some(
      (entry) => entry.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async getUser(req, res) {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).send({ message: "Bir id belirtmelisin." });
    }

    try {
      const user = await this.findUserById(userId);
      if (user) {
        const guilds = this.client.guilds.cache
          .map((guild) => {
            const member = guild.members.cache.get(userId);
            if (member) {
              return {
                serverName: guild.name,
                displayName: member.displayName,
              };
            }
            return null;
          })
          .filter((guild) => guild !== null);

        const nameCounts = {};
        guilds.forEach((guild) => {
          if (guild !== null) {
            const name = guild.displayName.replace(
              /[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g,
              "",
            );
            nameCounts[name] = (nameCounts[name] || 0) + 1;
          }
        });

        let maxCountName = 0;
        let topName = "";
        Object.entries(nameCounts).forEach(([name, count]) => {
          if (count > maxCountName) {
            maxCountName = count;
            topName = name;
          }
        });

        let mostUsedName = topName;
        if (!Genders.Names.some((x) => x.name.includes(topName))) {
          let mostUsedGenderName = "";
          let mostUsedGenderCount = 0;
          Genders.Names.forEach((gender) => {
            if (
              nameCounts[gender.name] &&
              nameCounts[gender.name] > mostUsedGenderCount
            ) {
              mostUsedGenderCount = nameCounts[gender.name];
              mostUsedGenderName = gender.name;
            }
          });
          mostUsedName = mostUsedGenderName;
        }

        const ageCounts = {};
        guilds.forEach((guild) => {
          if (guild !== null) {
            const age = guild.displayName.replace(/\D/g, "");
            if (age !== "") {
              ageCounts[age] = (ageCounts[age] || 0) + 1;
            }
          }
        });

        let maxCountAge = 0;
        let topAge = "";
        Object.entries(ageCounts).forEach(([age, count]) => {
          if (count > maxCountAge) {
            maxCountAge = count;
            topAge = age;
          }
        });

        const cinsiyet = this.getGender(mostUsedName);
        res.status(200).json({
          status: true,
          ...user.user,
          base: {
            topName: mostUsedName || null,
            topAge: topAge !== "" ? parseInt(topAge) : null,
            gender: cinsiyet || null,
          },
          guilds: guilds.length > 0 ? guilds : [],
        });
      } else {
        res
          .status(404)
          .send({ status: false, message: "Belirlenen üye bulunamadı." });
      }
    } catch (error) {
      global.logger.error("Error fetching user:", error);
      res.status(500).send({ status: false, message: "Internal server error" });
    }
  }

  async findUserById(userId) {
    for (const guild of this.client.guilds.cache.values()) {
      try {
        const member = await guild.members.fetch(userId);
        if (member) {
          return member;
        }
      } catch (error) {
        if (error.code !== 10007) {
          global.logger.error(
            `Error fetching member in guild ${guild.id}:`,
            error,
          );
        }
      }
    }
    return null;
  }
}

module.exports = { UserController };

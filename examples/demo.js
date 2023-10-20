"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var anilist = new __1.META.Anilist();
anilist.fetchAnimeInfo("21").then(function (data) {
    console.log(data);
});

const common = require("./common.js");

module.exports = {
    command_NotFound: () => "알 수 없는 명령어에요! 명령어를 다시 한 번 확인해주세요😅",
    command_HelpMain: (screenName) => "\n인터렉티브 미세먼지 정보봇, 『더스트.온.미』에요!\n" +
                                      "현재 개발 단계라 일부 기능/명령어가 없거나 작동하지 않을 수 있어요.\n" +
                                      `명령어는 【@${screenName} [명령어]】 형태로 멘션하시면 돼요.\n\n` +
                                      "사용 API : 한국환경공단 대기오염정보 OpenAPI\n" +
                                      ((common.isUsableVar(common.gitRevision)) ? `개발 리비전 : ${common.gitRevision}` : ""),
    command_HelpCommand: (callerId, maintainerAccountId) => "명령어 목록\n\n" +
                                                            ((callerId === maintainerAccountId) ? "🔧 테스트 : 봇 관리자용 명령어\n" : "") +
                                                            "💬 도움말 : 간단한 도움말과 명령어 목록을 보여드려요.\n",
    command_Uptime: (uptime) => `잘 들려요! 현재 ${uptime.days}일 ${uptime.hours}시 ${uptime.minutes}분 ${uptime.seconds}초동안 가동되고 있어요.`
}
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
                                                            "💬 도움말 : 간단한 도움말과 명령어 목록을 보여드려요.\n" +
                                                            "🕛 평균 [시도 이름] : 입력한 시 혹은 도의 현 시간 평균 미세먼지 정보를 알려드려요.\n",
                                                            
    command_Uptime: (uptime) => `잘 들려요! 현재 ${uptime.days}일 ${uptime.hours}시 ${uptime.minutes}분 ${uptime.seconds}초동안 가동되고 있어요.`,

    command_ParametersTooManyOrLess: () => "입력이 너무 적거나 많아요😰 도움말을 참고해주세요!",

    command_ParametersUnknownError: () => "알 수 없는 파라미터 오류! 개발자에게 알려주시기 바라요🤒",

    command_NoSidoNameFound: () => "입력하신 시도명을 이해할 수 없어요😱 시도명을 확인해 주세요!",

    command_NonUsableTargetAPIData: () => "API 데이터에 오류가 생긴 것 같아요😡 개발자에게 알려주시기 바라요!",

    command_SpecificSidoHourlyAverage: (sidoName, updatedDateTime, pm10, pm25) => `\n${sidoName}의 현 시간 평균 미세먼지 수치에요.\n` +
                                                                                  `업데이트 일시 : ${updatedDateTime}\n\n` +
                                                                                  `PM10 (미세먼지) : ${pm10}${common.pmDustUnit}\n` +
                                                                                  `PM2.5 (초미세먼지) : ${pm25}${common.pmDustUnit}`,
}
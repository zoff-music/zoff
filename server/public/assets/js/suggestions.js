var Suggestions = {
  catchUserSuggests: function(params, single) {
    if (single) {
      number_suggested = number_suggested + 1;
    } else {
      number_suggested = number_suggested + params.length;
    }
    for (var i = 0; i < params.length; i++) {
      if (document.querySelectorAll("#suggested-" + params[i].id).length > 0) {
        number_suggested -= 1;
      }
    }
    var to_display = number_suggested > 9 ? "9+" : number_suggested;
    if (number_suggested > 0 && Admin.logged_in) {
      Helper.removeClass(
        document.querySelector(".suggested-link span.badge.new.white"),
        "hide"
      );
    }
    document.querySelector(
      ".suggested-link span.badge.new.white"
    ).innerText = to_display;
    if (single) {
      Suggestions.createSuggested(params);
    } else {
      for (var x in params) {
        Suggestions.createSuggested(params[x]);
      }
    }
    Suggestions.checkUserEmpty();
  },

  createSuggested: function(params) {
    var duration = Helper.secondsToOther(params.duration);
    var video_id = params.id;
    var video_title = params.title;
    var date = new Date(params.added * 1000);
    var addedTime =
      Helper.pad(date.getDate()) +
      "." +
      Helper.pad(date.getMonth()) +
      "." +
      Helper.pad(date.getYear() - 100);
    var toSend = {
      id: video_id,
      title: video_title,
      length: params.duration,
      duration: duration,
      votes: addedTime,
      extra: "Added"
    };
    if (params.added_by != undefined) {
      toSend.extra += " by " + params.added_by;
    }
    if (params.source) toSend.source = params.source;
    else {
      toSend.source = "youtube";
    }
    if (params.thumbnail) toSend.thumbnail = params.thumbnail;
    var song = List.generateSong(toSend, false, false, false, true);
    var testingElem;
    try {
      testingElem = document.getElementById(video_id);
    } catch (e) {}

    if (
      !testingElem &&
      document.querySelectorAll("#suggested-" + video_id).length == 0
    ) {
      document
        .getElementById("user-suggest-html")
        .insertAdjacentHTML("beforeend", song);
    }
  },

  fetchYoutubeSuggests: function(id) {
    if (videoSource == "soundcloud") {
      Helper.addClass(document.querySelector(".suggest-title-info"), "hide");
      Helper.addClass("#suggest-song-html", "hide");
      return;
    } else {
      Helper.removeClass(document.querySelector(".suggest-title-info"), "hide");
      Helper.removeClass("#suggest-song-html", "hide");
    }
    var get_url =
      "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=" +
      id +
      "&type=video&key=" +
      getYoutubeKey();
    var video_urls =
      "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id,statistics&fields=pageInfo,items(id,contentDetails,statistics(viewCount),snippet(categoryId,channelTitle,publishedAt,title,description,thumbnails))&key=" +
      getYoutubeKey() +
      "&id=";

    Helper.ajax({
      type: "GET",
      url: get_url,
      dataType: "jsonp",
      success: function(response) {
        response = JSON.parse(response);
        var this_resp = response.items.slice(0, 5);
        for (var i = 0; i < this_resp.length; i++) {
          var data = this_resp[i];
          video_urls += data.id.videoId + ",";
        }

        Helper.ajax({
          type: "GET",
          url: video_urls,
          dataType: "jsonp",
          success: function(response) {
            response = JSON.parse(response);
            Helper.setHtml("#suggest-song-html", "");
            for (var i = 0; i < response.items.length; i++) {
              var song = response.items[i];
              var duration = song.contentDetails.duration;
              var length = Search.durationToSeconds(duration);
              duration = Helper.secondsToOther(
                Search.durationToSeconds(duration)
              );
              var video_id = song.id;
              var video_title = song.snippet.title;
              var viewCount = 0;
              try {
                viewCount = song.statistics.viewCount
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
              } catch (e) {}

              try {
                document.getElementById("suggest-song-html").insertAdjacentHTML(
                  "beforeend",
                  List.generateSong(
                    {
                      id: video_id,
                      title: video_title,
                      length: length,
                      duration: duration,
                      votes: viewCount,
                      extra: "Views",
                      source: "youtube"
                    },
                    false,
                    false,
                    false
                  )
                );
              } catch (e) {}
            }
          }
        });
      }
    });
  },

  checkUserEmpty: function() {
    var length = document.getElementById("user-suggest-html").children.length;
    if (length === 0) {
      Helper.addClass("#user_suggests", "hide");
    } else if (Admin.logged_in) {
      Helper.removeClass("#user_suggests", "hide");
    }
  }
};

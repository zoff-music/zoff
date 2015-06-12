
    <div class="section">
    <h3 id="remote-text"></h3>
    </div>
        <div class="section">

            <!--<p class="range-field">
                <input type="range" title="Volume" id="volume-control" style="display:none;" min="0" value="100" max="100" />
            </p>-->

            <form class="row" id="base" onsubmit="window.location.href = '/remote/'+this.chan.value;return false;">
                    <div class="input-field col s12">
                        <input
                            class="input-field"
                            type="text"
                            id="search"
                            name="chan"
                            title="Type channel name here to create or listen to a channel. Only alphanumerical chars. [a-zA-Z0-9]+"
                            autocomplete="off"
                            list="searches"
                            required pattern="[a-zA-Z0-9]+"
                            spellcheck="false"
                            maxlength="10"
                            autocomplete
                            length="10"
                        />
                        <label for="search" id="forsearch">Type ID of host to be controlled</label>
                </div>
            </form>

            <div class="rc" id="remote-controls">
                <a class="chan-link waves-effect btn green" onclick="play();">
                    <i id="remote_play" class="mdi-av-play-arrow"></i>
                </a>
                <a class="chan-link waves-effect btn gray" onclick="pause();">
                    <i id="remote_pause" class="mdi-av-pause"></i>
                </a>
                <a class="chan-link waves-effect btn blue" onclick="skip();">
                    <i id="remote_skip" class="mdi-av-skip-next"></i>
                </a>
            </div>

            <i class="mdi-av-volume-up slider-vol rc"></i>
            <div class="rc" id="volume-control" title="Volume"></div>

        </div>

        <div class="section about-remote">
            <b>Here you can control another Zöff player from any device.</b>
            <br>
            To find the ID of your player, click the Conf <i class="mdi-action-settings"></i> icon on the top right of the player page, then "Remote Control".
            <br>You can either scan the QR code or type the ID manually.
        </div>
        <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
        <script type="text/javascript" src="/static/js/remotecontroller.js"></script>
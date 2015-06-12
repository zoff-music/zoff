<div class="section">
            <form class="row" id="base" method="get">
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
                            maxlength="18"
                            autocomplete
                            length="18"
                        />
                        <label for="search">Find or create radio channel</label>
                        <datalist id="searches">
                        </datalist>
                </div>
            </form>
        </div>

        <div class="section">
            <div id="preloader" class="progress">
                <div class="indeterminate"></div>
            </div>
            <ul class="row" id="channels">
                <div id="chan-html" class="hide">
                    <li id="chan-card" class="col s12 m4 l3">
                        <div class="card">
                            <a class="chan-link">
                                <div class="chan-bg card-image cardbg"></div>
                            </a>
                            <div class="card-content">
                                <p class="left-align">
                                    <span class="chan-name flow-text truncate"></span>
                                    <br>
                                    <span class="highlighted">Viewers:&nbsp</span>
                                    <span class="chan-views"></span>
                                    <br>
                                    <span class="highlighted">Songs:&nbsp</span>
                                    <span class="chan-songs"></span>
                                </p>
                            </div>
                            <div class="card-action">
                                <a class="chan-link waves-effect waves-orange btn-flat">Listen</a>
                            </div>
                        </div>
                    </li>
                </div>
            </ul>
        </div>
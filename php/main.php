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
                
            </ul>
        </div>

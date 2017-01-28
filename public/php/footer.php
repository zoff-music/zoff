<div id="contact" class="modal">
            <div class="modal-content">
                <h4>Want to contact us?</h4>
                <div id="contact-container">
                    <form id="contact-form" method="post" onsubmit="return false;">
                      <div class="input-field">
                        <input id="contact-form-from" name="from" type="email" autocomplete="off" class="validate" />
                        <label for="contact-form-from" class="noselect">Email</label>
                      </div>
                      <div class="input-field">
                        <input id="contact-form-message" name="message" type="text" autocomplete="off">
                        <label for="contact-form-message" class="noselect">Message</label>
                      </div>
                        <button class="contact-button-submit" id="submit-contact-form">Send</button>
                        <div class="valign hide" id="send-loader">
                             <div class="preloader-wrapper small active">
                              <div class="spinner-layer spinner-blue">
                                <div class="circle-clipper left">
                                  <div class="circle"></div>
                                </div><div class="gap-patch">
                                  <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                  <div class="circle"></div>
                                </div>
                              </div>

                              <div class="spinner-layer spinner-red">
                                <div class="circle-clipper left">
                                  <div class="circle"></div>
                                </div><div class="gap-patch">
                                  <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                  <div class="circle"></div>
                                </div>
                              </div>

                              <div class="spinner-layer spinner-yellow">
                                <div class="circle-clipper left">
                                  <div class="circle"></div>
                                </div><div class="gap-patch">
                                  <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                  <div class="circle"></div>
                                </div>
                              </div>

                              <div class="spinner-layer spinner-green">
                                <div class="circle-clipper left">
                                  <div class="circle"></div>
                                </div><div class="gap-patch">
                                  <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                  <div class="circle"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
<footer class="page-footer cursor-default">
    <div class="container">
        <div class="row">
            <div class="col l6 s12">
                <h5 class="white-text">Zöff</h5>
                <p class="grey-text text-lighten-4">The shared YouTube radio</p>
                <p class="grey-text text-lighten-4">
                    Being built around the YouTube search and video API
                    it enables the creation of collaborative and shared live playlists,
                    with billions of videos and songs to choose from, all for free and without registration.
                    <br />
                    Enjoy!
                </p>
                <ul id="footer-buttons">
                  <li>
                      <a class="modal-trigger waves-effect cyan darken-2 btn help-button-footer" title="Need help with the site?" onclick="$('#help').modal('open')">
                        <i class="material-icons left footer-button-icon">help_outline</i>HELP
                      </a>
                  </li>
                  <li>
                    <a class="modal-trigger waves-effect blue-grey darken-2 btn help-button-footer hide-on-small-only" id="embed-button" title="Want to embed this channel?" onclick="$('#embed').modal('open')">
                        <i class="material-icons left footer-button-icon">code</i>EMBED
                    </a>
                  </li>
                  <li>
                    <a class="modal-trigger waves-effect red darken-2 btn help-button-footer" id="contact-button" title="Contact us" onclick="$('#contact').modal('open')">
                    <i class="material-icons left footer-button-icon">email</i>CONTACT
                    </a>
                  </li>
                </ul>
                <p id="latest-commit" class="grey-text text-lighten-4 truncate"></p>
            </div>
            <div class="col l4 offset-l2 s12 valign-wrapper">
                <ul>
                    <li>
                        <a href="https://github.com/zoff-music/">
                            <img title="Contribute on GitHub" src="/public/images/GitHub_Logo.png" alt="GitHub" />
                        </a>
                        <p>
                            <a id="facebook-code-link" class="waves-effect waves-light btn light-blue share shareface" href="https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>" target="popup" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>','Share Playlist','width=600,height=300')">
                                <img class="left" src="/public/images/facebook.png" alt="Share on Facebook" />Share on&nbsp;Facebook
                            </a>
                        </p>
                        <p>
                            <a id="twitter-code-link" class="waves-effect waves-light btn light-blue share" href="http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;text=Check%20out%20this%20playlist%20<?php echo ucfirst($list); ?>%20on%20Z&ouml;ff!&amp;via=zoffmusic" target="popup" onclick="window.open('http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;text=Check%20out%20this%20playlist%20<?php echo ucfirst($list); ?>%20on%20Z&ouml;ff!&amp;via=zoffmusic','Share Playlist','width=600,height=300')">
                                <img class="left" src="/public/images/twitter.png" alt="Share on Twitter" />Share on&nbsp;Twitter
                            </a>
                        </p>
                        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" id="donate_form">
                          <input type="hidden" name="cmd" value="_s-xclick">
                          <input type="hidden" name="hosted_button_id" value="JEXDYP59N5VWE">
                          <a title="Like what we made? Help us by donating (a) beer!" class="waves-effect waves-light btn orange light-blue share" onclick="document.getElementById('donate_form').submit();">
                          <i class="material-icons left footer-button-icon">payment</i>Donate
                          </a>
                        </form>
                        <p class="hide-on-small-only">
                            <a id="qr-code-link" target="_blank" href="//chart.googleapis.com/chart?chs=500x500&amp;cht=qr&amp;chl=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;choe=UTF-8&amp;chld=L%7C1" >
                                <img id="qr-code-image-link" class="card rounded" src="//chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;choe=UTF-8&amp;chld=L%7C1" alt="QRCode for link" title="QR code for this page, for easy sharing!" />
                            </a>
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="footer-copyright">
        <div class="container">
            &copy; <?php echo date("Y"); ?>
            <a href="http://nixo.no">Nixo</a> &amp;
            <a href="http://kasperrt.no">KasperRT</a>
            &nbsp;&nbsp;All Rights Reserved.
        </div>
    </div>
</footer>

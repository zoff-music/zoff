<?php

if(isset($_GET['chan'])){
    $chan = htmlspecialchars($_GET['chan']);
    header('Location: '.$chan);
}

$dir = scandir('./lists');
$channels = array();
$all_channels = array();
$chan_data = array(); //for all chan data
$time = 60*60*24*4; //4 dager
$to = 60*60*24*2;
$i = 0;
$v = 0;
$tooMany = false;

$dir = "./lists";
chdir($dir);
array_multisort(array_map('filemtime', ($fil = glob("*.json"))), SORT_DESC, $fil);
$viewers = array();

foreach($fil as $files){
    if(strpos($files, '.json') !== FALSE){
        $time_lasted = time() - filemtime($files);
        if($time_lasted > $to)
        {
            $file = file_get_contents($files); 
            $data = json_decode($file, TRUE);
            if(isset($data["nowPlaying"])){
                $q = array_values($data["nowPlaying"]);
            }
        }
        if($time_lasted < $time){
            $file = file_get_contents($files); //Checking if the channel has the setting for showing on the frontpage set to true.
            $data = json_decode($file, TRUE);
            if($i <= 40 && (!array_key_exists("frontpage", $data['conf']) || $data['conf']['frontpage'] == "true")){                           //If it is true, the channelname will be shown on the frontpage
                array_push($channels, ucfirst(str_replace(".json", "", $files)));
                array_push($viewers, sizeof($data["conf"]["views"]));
                array_push($chan_data, $data);
            }
        }
        $i++;
        array_push($all_channels, ucfirst(str_replace(".json", "", $files)));
    }

}
?>

<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head>
    <?php include("header.php"); ?>
</head>
<body>
    <header>
        <nav>
            <div class="nav-wrapper">
                <a href="zoff.no" class="brand-logo hide-on-small-only"><img id="zicon" src="static/images/squareicon_small.png" alt="zöff"></a>
                <a href="zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a href="#">About</a></li>
                    <li><a href="#">GitHub</a></li>
                    <li><a href="#">Legal</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <main class="center-align container">
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
                            autofocus
                        />
                        <label for="search">Find or create radio channel</label>
                        <datalist id="searches">
                            <?php foreach($all_channels as $channel){echo "<option value='".htmlspecialchars($channel)."'> ";} ?>
                        </datalist>
                </div>
            </form>
        </div>
        
        <div class="section">
            <ul class="row" id="channels">
                <?php 
                    foreach ($chan_data as $v => $d)
                    {
                        if(count($d["songs"])>0)
                        {
                            $ch=htmlspecialchars($channels[$v]);
                            $views=$viewers[$v];
                            $now=reset($d["nowPlaying"]);
                            $img="http://img.youtube.com/vi/".$now["id"]."/hqdefault.jpg";
                            //echo "<a class='channel' href='./".$ch."' title='Viewers: ~".$viewers[$v]."'>".$ch."</a>";
                    ?>
                    <li class="col s12 m4 l3">
                        <div class="card">
                            <a href="<?php echo $ch; ?>">
                                <div class="card-image cardbg" style="background-image:url('<?php echo $img; ?>')">
                                    <img class="invisible" src="<?php echo $img; ?>">
                                </div>
                            </a>
                            <div class="card-content">
                                <p class="left-align">
                                    <span class="flow-text truncate"><?php echo $ch; ?></span>
                                    <br>
                                    <span class="highlighted">Viewers:&nbsp</span><?php echo $views; ?>
                                    <br>
                                    <span class="highlighted">Songs:&nbsp</span><?php echo(count($d["songs"])+1); ?>
                                </p>
                            </div>
                            <div class="card-action">
                                <a href="<?php echo $ch; ?>" class="waves-effect waves-teal btn-flat">Listen</a>
                            </div>
                        </div>
                    </li>
                    <?php
                        }
                    } 
                ?>
            </ul>
        </div>
    </main>

    <footer class="page-footer">
        <div class="container">
            <div class="row">
                <div class="col l6 s12">
                    <h5 class="white-text">Zöff</h5>
                    <p class="grey-text text-lighten-4">The shared youtube radio</p>
                    <p class="grey-text text-lighten-4">
                        Being built around the youtube search and video API
                        it enables the creation of collaboratiive and shared live playlists, 
                        with billions of videos and songs to choose from, all for free and without registration.
                        <br>
                        Enjoy!
                    </p>
                </div>
                <div class="col l4 offset-l2 s12 valign-wrapper">
                    <ul>
                        <li>
                            <a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff">
                                <img title="Get it on Google Play" src="static/images/google_play.png">
                            </a>
                            <a href="https://github.com/nixolas1/Zoff">
                                <img title="Contribute on GitHub" src="static/images/GitHub_Logo.png">
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-copyright">
            <div class="container">
                &copy; <?php echo date("Y"); ?>
                <a href="//nixo.no">Nixo</a> &amp; 
                <a href="//kasperrt.no">KasperRT</a> 
            </div>
        </div>
    </footer>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script type="text/javascript" src="static/js/lib/materialize.js"></script>
    <script type="text/javascript" src="static/js/nochan.js"></script>

    <!-- Piwik tracking -->
    <script type="text/javascript">
      var _paq = _paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="//zoff.no/analyse/";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', 1]);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
      })();
    </script>
    <noscript><p><img src="//zoff.no/analyse/piwik.php?idsite=1" style="border:0;" alt="" /></p></noscript>
    <!-- End Piwik Code -->

    </body>
</html>

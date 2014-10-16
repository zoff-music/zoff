<?php
/*
 * 
 * File: index.php
 * Description: Main controller
 *
 */

// Require the autoloader
require 'base.php';
require ZOFF_BASE_PATH . '/vendor/autoload.php';

// New instance of smarty
$template = new Smarty();

// Set smarty options
$template->left_delimiter = '[[+'; 
$template->right_delimiter = ']]';

// Check if we are in a room or not
if (!isset($_GET['q'])) {
    // Not in a room, fetch active rooms
    
    $dir = scandir(ZOFF_BASE_PATH . '/lists');
    $channels = [];
    $time = 60 * 60 * 24 * 3;
    
    foreach ($dir as $files) {
        if (strpos($files, '.json') !== false) {
            if (time() - filemtime(ZOFF_BASE_PATH . '/lists/' . $files) < $time) {
                $channels[] = ucfirst(str_replace('.json', '', $files));
            }
        }
    }
    
    // Build string for search
    $search_string = '';
    foreach ($channels as $channel) {
        $search_string .= '<option value="' . htmlspecialchars(urldecode($channel)) . '">';
    }
    
    // Build string for displaying active rooms
    $display_string = '';
    foreach ($channels as $channel) {
        $display_string .= '<a class="channel" href="' . htmlspecialchars($channel) . '">' . 
                           htmlspecialchars(urldecode($channel)) . '</a>';
    }
    
    // Assign to Smarty
    $template->assign('SEARCH_STRING', $search_string);
    $template->assign('DISPLAY_STRING', $display_string);
    
    // Display template
    $template->display('index.tpl');
}
else {
    // In a room, check if it is a valid room or not
    if (file_exists(ZOFF_BASE_PATH . '/lists/' . strtolower($_GET['q']) . '.json')) {
        // Assign channel name
        $template->assign('CHANNEL_NAME', htmlspecialchars(urldecode($_GET['q'])));
    }
    else {
        // This is not a channel
        header("Location: index.php");
        exit;
    }
    
    // Display the template
    $template->display('chan.tpl');
}
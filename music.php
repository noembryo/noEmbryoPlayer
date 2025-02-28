<?php
include("./PageX.class.php");

$page = new PageX;
$page->template_file = "./base.html";
$page->var_name_list = "head,title,content,foot";

$page->head = <<<HEAD
<!--Keep-->\n
<script src="embryoplayer.js"></script>
HEAD;

$page->title = <<<TITLE
noEmbryo Music Player\n
TITLE;

$page->content = <<<CONTENT
<!--Keep-->\n
<script>startApp();</script>
CONTENT;

$page->foot = <<<FOOT

FOOT;

$page->display_page();
?>

jQuery(document).ready(function(){
        jQuery('#hide-show').on('click', function(event) {        
             jQuery('#left-panel-info').slideToggle('show');
        });
		jQuery('#hide-show2').on('click', function(event) {        
             jQuery('#wordcloud-panel').slideToggle('show');
        });
    });
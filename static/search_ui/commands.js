function keyevent(event){
        event = event || window.event;
        if (event.keyCode == 13) {
            const e = document.getElementById('search').value;
            if (e==''){return}
            window.location.href = `/login/search_music?wd=${e}`
   }
        }
function btnevent(){
    const e = document.getElementById('search').value;
    if (e==''){return}
    window.location.href = `/login/search_music?wd=${e}`
}
function getQueryVariable(variable) {
         var query = window.location.search.substring(1);
         var vars = query.split("&");
         for (var i=0;i<vars.length;i++) {
              var pair = vars[i].split("=");
              if(pair[0] == variable){return pair[1];}
         }
         return(false);
    }
document.getElementById('search').value=decodeURI(getQueryVariable('wd'));
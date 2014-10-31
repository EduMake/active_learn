$( document ).ready(function() {
        // Get the text field that we're going to track
 var field = document.getElementById("tincanemail");
 
 // See if we have an tincan_mbox value
 // (this will only happen if the page is accidentally refreshed)
 if (localStorage.getItem("tincan_mbox")) {
    // Restore the contents of the text field
    field.value = localStorage.getItem("tincan_mbox");
 }
 
 // Listen for changes in the text field
 field.addEventListener("change", function() {
    // And save the results into the session storage object
    localStorage.setItem("tincan_mbox", field.value);
    defaultStatement.actor.mbox = localStorage.getItem("tincan_mbox");
    console.log("field.value =", field.value);
 });    
 
});

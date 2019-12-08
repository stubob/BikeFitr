$(document).ready(function(){
    $('#save').click(function(){
        var str = $( "#body_form" ).serialize();
        $.ajax({
           type: "POST",
           url:  "/body",
           contentType:"application/json; charset=utf-8",

            data: JSON.stringify({
                id: $('#id').val(),
                ft_length: $('#ft_length').val(),
                low_leglength: $('#low_leglength').val(),
                up_leglength: $('#up_leglength').val(),
                torso_length: $('#torso_length').val(),
                up_armlength: $('#up_armlength').val(),
                low_armlength: $('#low_armlength').val()
             })
         })
        .done(
            function(data, status){
                var json = JSON.parse(data);
                $('#id').val() = json.id;
                alert("Data: " + data + "\nStatus: " + status);
            })
     });
})
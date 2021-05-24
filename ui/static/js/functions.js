function getRecipeById(id) {

    var formation = cngRestManager.doSynchronousServerQueryWithFullPath("/formation/" + id, true, {}, "application/json", "application/json", 2000, null, null, null);
    console.log(formation);
    $('#id-formation').val(formation.id);
    $('#dateDeb').val(Date.parse(formation.date_debut).toString("yyyy-MM-dd"));
    $('#dateFin').val(Date.parse(formation.date_fin).toString("yyyy-MM-dd"));
    $('#nbrHeures').val(formation.nbr_heures);
    $('#cout').val(formation.cout);

}

function deleteRecipeById(id) {

    if (confirm("Etes vous sûr de vouloir supprimer ?")) {
        var data = {"id": id}
        jsondata = JSON.stringify(data);
        var result = cngRestManager.doSynchronousServerQueryWithFullPath("/delete/personne", false, jsondata, "application/json", "application/json", 2000, null, null, null);
        console.log(result);
        window.location.href = "/"
    } else {
        // Code à éxécuter si l'utilisateur clique sur "Annuler"
    }

}

function updateRecipeById(personne) {
    var personne = JSON.stringify(personne);
    $.ajax({
        url: "/personne/update",
        type: 'POST',
        data: personne,

        success: function (jsondata) {
            console.log(jsondata)
            $("html").html(jsondata);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError)
        }
    });
}


function saveOrCheckUser() {

    var user = {"user": $('#login').val(), "pass_word": $('#passWord').val()}

    $.ajax({
        url: "/saveOrCheckUser",
        type: 'POST',
        data: JSON.stringify(user),

        success: function (jsondata) {
            $('#responseLogin').html("");
            $('#responsePass').html("");
            if (jsondata != "") {
                var response = JSON.parse(jsondata);
                var msg = response.msg;
                if (msg == "record not found") {
                    $('#responseLogin').html("User introuvale !")
                } else if (msg == "Mot de passe incorrect") {
                    $('#responsePass').html("Mot de passe incorrect")
                } else {
                    window.location.href = "/"
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError)
        }
    });
}

function directionTo(path) {
    window.location.href = path;
}




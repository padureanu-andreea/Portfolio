package ro.ase.cts.singleton;

public class Hotel {
    private String numeHotel;
    private int numarCamere;
    private int numarCamereOcupate;

    private static Hotel instance = null;

    private Hotel(String numeHotel, int numarCamere, int numarCamereOcupate) {
        this.numeHotel = numeHotel;
        this.numarCamere = numarCamere;
        this.numarCamereOcupate = numarCamereOcupate;
    }

    public static synchronized Hotel getInstance(String numeHotel, int numarCamere, int numarCamereOcupate){
        if(instance == null){
            instance = new Hotel(numeHotel, numarCamere, numarCamereOcupate);
        }
        return instance;
    }

    public void rezervaCamera(){
        if(this.numarCamere > this.numarCamereOcupate){
            numarCamereOcupate++;
            System.out.println("Rezervarea a fost finalizata!");
        } else
            System.out.println("Nu mai exista camere disponibile!");
    }

    public void afiseazaDetaliiHotel(){
        StringBuilder builder = new StringBuilder();
        builder.append("Hotelul ");
        builder.append(this.numeHotel);
        builder.append(" are ");
        builder.append(numarCamere);
        builder.append(" camere in total si ");
        builder.append(numarCamere-numarCamereOcupate);
        builder.append(" camere disponibile.");
        System.out.println(builder);
    }

    public void afiseazaGradOcupare(){
        int grad;
        grad = numarCamereOcupate/numarCamere*100;
        StringBuilder builder = new StringBuilder();
        builder.append("Gradul de ocupare al hotelului este de ");
        builder.append(grad);
        System.out.println(builder);
    }
}

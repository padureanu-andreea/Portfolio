package ro.ase.cts.clase;

public class CalatorAbonat implements Calator{
    private String nume;
    private float sold;

    public void platesteBilet(float pret){
        if(this.sold > pret){
            System.out.println(this.nume + " plateste " + pret + " lei pentru o calatorie.");
            this.sold-=pret;
        } else{
            System.out.println("Sold insuficient. Mergeti pe jos!");
        }
    }

    public float getSold() {
        return sold;
    }

    public void setSold(float sold) {
        this.sold = sold;
    }

    public CalatorAbonat(String nume) {
        this.nume = nume;
    }

    @Override
    public void notificare(String nrLinie) {
        System.out.println(this.nume + " " + nrLinie);
    }
}

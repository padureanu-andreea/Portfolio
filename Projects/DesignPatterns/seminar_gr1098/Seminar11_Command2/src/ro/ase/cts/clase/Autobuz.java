package ro.ase.cts.clase;

public class Autobuz {
    private String producator;

    public Autobuz(String producator) {
        this.producator = producator;
    }

    public void pleacaPeTraseu(int nrLinie){
        System.out.println("Autobuzul " + this.producator + " merge pe traseul " + nrLinie);
    }
}

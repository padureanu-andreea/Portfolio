package ro.ase.cts.clase;

public class Cafea extends BauturaAbstracta implements IBauturaPrototype {
    public Cafea(String nume, int volum, double pret) {
        super(nume, volum, pret);
    }

    @Override
    public void preparare() {
        System.out.println("Cafeaua se prepara astfel:");
        System.out.println("1. Se macina boabele de cafea si se pun in aparat.");
        System.out.println("2. Se extrage cafeaua la espressor.");
        System.out.println("3. Se spumeaza laptele si se adauga.");
    }

    @Override
    public String getDetalii() {
        StringBuilder builder = new StringBuilder();
        builder.append(super.nume);
        builder.append(" are ").append(super.volum);
        builder.append(" mililitrii si costa ").append(super.pret);
        builder.append(" lei.");

        return builder.toString();
    }

    @Override
    public double getPret() {
        System.out.println("Pretul unei cafele este:");
        return super.pret;
    }

    @Override
    public boolean adaugaTopping() {
        System.out.println("S-a adaugat topping la cafea!");
        return true;
    }

    public Cafea() {
    }

    @Override
    public IBauturaPrototype clone() {
        Cafea cafea = new Cafea();
        cafea.nume = this.nume;
        cafea.volum = this.volum;
        cafea.pret = this.pret;
        return cafea;
    }
}

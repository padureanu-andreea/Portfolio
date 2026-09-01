package ro.ase.cts.clase;

public class AbonamentLunar implements AbstractMembership{
    private static AbonamentLunar instance = null;

    private String nume;
    private double pret;
    private String dataExpirare;

    public AbonamentLunar(String nume, double pret, String dataExpirare) {
        this.nume = nume;
        this.pret = pret;
        this.dataExpirare = dataExpirare;
    }

    public static synchronized AbonamentLunar getInstance(String nume, double pret, String dataExpirare){
        if(instance == null){
            instance = new AbonamentLunar(nume, pret, dataExpirare);
        }
        return instance;
    }

    @Override
    public void afiseazaDetaliiAbonament() {
        StringBuilder builder = new StringBuilder();
        builder.append("Numele abonamentului este: ").append(this.nume);
        builder.append(". Pretul este de: ").append(this.pret);
        builder.append(" lei. Abonamentul expira la data: ").append(this.dataExpirare).append(".");
        System.out.println(builder);
    }
}

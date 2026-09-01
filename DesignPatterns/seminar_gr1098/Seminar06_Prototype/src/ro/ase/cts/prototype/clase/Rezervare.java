package ro.ase.cts.prototype.clase;

public class Rezervare implements RezervareAbstracta{
    private String numeClient;
    private int oraRezervare;
    private int ziuaRezervarii;
    private String nrTelefon;

    public Rezervare(String numeClient, int oraRezervare, int ziuaRezervarii, String nrTelefon) {
        if(numeClient.length() > 3){
            this.numeClient = numeClient;}
        else this.numeClient = "Maricica";

        if(oraRezervare > 9 && oraRezervare < 23){
            this.oraRezervare = oraRezervare;}
        else this.oraRezervare = 9;

        if(ziuaRezervarii < 31){
            this.ziuaRezervarii = ziuaRezervarii;}
        else this.ziuaRezervarii = 1;

        if(nrTelefon.length() == 10){
            this.nrTelefon = nrTelefon;}
        else this.nrTelefon = "0721111111";
    }

    public Rezervare() {
    }

    //merge sa fac si clone cu parametrii ca sa pot sa schimb atunci cand clonez
    //pot sa fac si setteri
    @Override
    public RezervareAbstracta clone() {
        //deep copy
        Rezervare rezervareNoua = new Rezervare();

        rezervareNoua.numeClient = this.numeClient;
        rezervareNoua.oraRezervare = this.oraRezervare;
        rezervareNoua.nrTelefon = this.nrTelefon;
        rezervareNoua.ziuaRezervarii = this.ziuaRezervarii;

        return rezervareNoua;

        //return this.clone daca implementez IClonable, dar este shallow copy
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("Rezervare{");
        sb.append("numeClient='").append(numeClient).append('\'');
        sb.append(", oraRezervare=").append(oraRezervare);
        sb.append(", ziuaRezervarii=").append(ziuaRezervarii);
        sb.append(", nrTelefon='").append(nrTelefon).append('\'');
        sb.append('}');
        return sb.toString();
    }

    public void setOraRezervare(int oraRezervare) {
        if(oraRezervare > 9 && oraRezervare < 23){
            this.oraRezervare = oraRezervare;}
        else this.oraRezervare = 9;    }

    public void setZiuaRezervarii(int ziuaRezervarii) {
        if(ziuaRezervarii < 31){
            this.ziuaRezervarii = ziuaRezervarii;}
        else this.ziuaRezervarii = 1;    }
}

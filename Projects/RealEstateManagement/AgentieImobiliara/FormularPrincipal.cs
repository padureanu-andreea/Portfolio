using AgentieImobiliara;
using System;
using System.Collections.Generic;
using System.Data.OleDb;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Text;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Text.Json;
using System.Security.Policy;
using System.Diagnostics;

namespace AgentieImobiliara
{
    public partial class FormularPrincipal : Form
    {
        private readonly string connString;

        private const string FISIER_AGENTI = "agenti.json";
        private const string FISIER_CLIENTI = "clienti.json";
        private const string FISIER_PROPRIETATI = "proprietati.json";
        private const string FISIER_OFERTE = "oferte.json";
        private const string FISIER_CERERI = "cereri.json";

        private List<Agent> listaAgenti = new List<Agent>();
        private List<Client> listaClienti = new List<Client>();
        private List<Property> listaProprietati = new List<Property>();
        private List<Offer> listaOferte = new List<Offer>();
        private List<ClientRequest> listaCereri = new List<ClientRequest>();

        private Dictionary<PropertyType, int> distributieTipuriProprietati;
        private Color culoareBaraGrafic = Color.RoyalBlue;
        private Color culoareTextGrafic = Color.Black;
        private Font fontTextGrafic = new Font("Arial", 8);
        private Font fontTitluGrafic = new Font("Arial", 12, FontStyle.Bold);

        private Property proprietateSelectataPentruOferta;
        private string modDeschidereFormular;

        public FormularPrincipal() : this("Toate")
        {
        }
        public FormularPrincipal(string tabDeAfisat)
        {
            InitializeComponent();

            this.modDeschidereFormular = tabDeAfisat;

            string dbFileName = "AgentieImobiliaraDB.accdb";
            string dbPath = Path.Combine(Application.StartupPath, dbFileName);
            connString = $"Provider=Microsoft.ACE.OLEDB.12.0;Data Source={dbPath}";

            if (!File.Exists(dbPath))
            {
                MessageBox.Show($"Fisierul bazei de date '{dbFileName}' nu a fost gasit in folderul aplicatiei: {Application.StartupPath}\n" +
                                "Functionalitatea de baza de date nu va opera corect.",
                                "Eroare Baza de Date", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

            switch (tabDeAfisat)
            {
                case "Proprietati":
                    if (tabControl1.TabPages.Contains(tabAgenti))
                        tabControl1.TabPages.Remove(tabAgenti);

                    if (tabControl1.TabPages.Contains(tabClienti))
                        tabControl1.TabPages.Remove(tabClienti);

                    if (tabControl1.TabPages.Contains(tabCereri))
                        tabControl1.TabPages.Remove(tabCereri);

                    if (tabControl1.TabPages.Contains(tabStatistici))
                        tabControl1.TabPages.Remove(tabStatistici);

                    if (tabControl1.TabPages.Contains(tabVizualizareFisierJSON))
                        tabControl1.TabPages.Remove(tabVizualizareFisierJSON);

                    tabControl1.SelectedTab = tabProprietati;

                    break;
                case "Agenti":
                    if (tabControl1.TabPages.Contains(tabProprietati))
                        tabControl1.TabPages.Remove(tabProprietati);

                    if (tabControl1.TabPages.Contains(tabClienti))
                        tabControl1.TabPages.Remove(tabClienti);

                    if (tabControl1.TabPages.Contains(tabCereri))
                        tabControl1.TabPages.Remove(tabCereri);

                    if (tabControl1.TabPages.Contains(tabAdaugaOferta))
                        tabControl1.TabPages.Remove(tabAdaugaOferta);

                    if (tabControl1.TabPages.Contains(tabVizualizeazaOferte))
                        tabControl1.TabPages.Remove(tabVizualizeazaOferte);

                    if (tabControl1.TabPages.Contains(tabStatistici))
                        tabControl1.TabPages.Remove(tabStatistici);

                    if (tabControl1.TabPages.Contains(tabVizualizareFisierJSON))
                        tabControl1.TabPages.Remove(tabVizualizareFisierJSON);

                    tabControl1.SelectedTab = tabAgenti;

                    break;
                case "Clienti":
                    if (tabControl1.TabPages.Contains(tabProprietati))
                        tabControl1.TabPages.Remove(tabProprietati);

                    if (tabControl1.TabPages.Contains(tabAgenti))
                        tabControl1.TabPages.Remove(tabAgenti);

                    if (tabControl1.TabPages.Contains(tabCereri))
                        tabControl1.TabPages.Remove(tabCereri);

                    if (tabControl1.TabPages.Contains(tabAdaugaOferta))
                        tabControl1.TabPages.Remove(tabAdaugaOferta);

                    if (tabControl1.TabPages.Contains(tabVizualizeazaOferte))
                        tabControl1.TabPages.Remove(tabVizualizeazaOferte);

                    if (tabControl1.TabPages.Contains(tabStatistici))
                        tabControl1.TabPages.Remove(tabStatistici);

                    if (tabControl1.TabPages.Contains(tabVizualizareFisierJSON))
                        tabControl1.TabPages.Remove(tabVizualizareFisierJSON);

                    tabControl1.SelectedTab = tabClienti;

                    break;
                case "ModCereriOferte":
                    if (tabControl1.TabPages.Contains(tabProprietati))
                        tabControl1.TabPages.Remove(tabProprietati);

                    if (tabControl1.TabPages.Contains(tabAgenti))
                        tabControl1.TabPages.Remove(tabAgenti);

                    if (tabControl1.TabPages.Contains(tabClienti))
                        tabControl1.TabPages.Remove(tabClienti);

                    if (tabControl1.TabPages.Contains(tabStatistici))
                        tabControl1.TabPages.Remove(tabStatistici);

                    if (tabControl1.TabPages.Contains(tabVizualizareFisierJSON))
                        tabControl1.TabPages.Remove(tabVizualizareFisierJSON);

                    tabControl1.SelectedTab = tabCereri;
                    break;

                case "Statistici":
                    if (tabControl1.TabPages.Contains(tabProprietati))
                        tabControl1.TabPages.Remove(tabProprietati);

                    if (tabControl1.TabPages.Contains(tabAgenti))
                        tabControl1.TabPages.Remove(tabAgenti);

                    if (tabControl1.TabPages.Contains(tabClienti))
                        tabControl1.TabPages.Remove(tabClienti);

                    if (tabControl1.TabPages.Contains(tabCereri))
                        tabControl1.TabPages.Remove(tabCereri);

                    if (tabControl1.TabPages.Contains(tabAdaugaOferta))
                        tabControl1.TabPages.Remove(tabAdaugaOferta);

                    if (tabControl1.TabPages.Contains(tabVizualizeazaOferte))
                        tabControl1.TabPages.Remove(tabVizualizeazaOferte);

                    if (tabControl1.TabPages.Contains(tabVizualizareFisierJSON))
                        tabControl1.TabPages.Remove(tabVizualizareFisierJSON);

                    tabControl1.SelectedTab = tabStatistici;
                    break;

                case "VizualizareFisier":
                    if (tabControl1.TabPages.Contains(tabProprietati)) tabControl1.TabPages.Remove(tabProprietati);
                    if (tabControl1.TabPages.Contains(tabAgenti)) tabControl1.TabPages.Remove(tabAgenti);
                    if (tabControl1.TabPages.Contains(tabClienti)) tabControl1.TabPages.Remove(tabClienti);
                    if (tabControl1.TabPages.Contains(tabCereri)) tabControl1.TabPages.Remove(tabCereri);
                    if (tabControl1.TabPages.Contains(tabAdaugaOferta)) tabControl1.TabPages.Remove(tabAdaugaOferta);
                    if (tabControl1.TabPages.Contains(tabVizualizeazaOferte)) tabControl1.TabPages.Remove(tabVizualizeazaOferte);
                    if (tabControl1.TabPages.Contains(tabStatistici)) tabControl1.TabPages.Remove(tabStatistici);

                    if (tabControl1.TabPages.Contains(tabVizualizareFisierJSON))
                    {
                        tabControl1.SelectedTab = tabVizualizareFisierJSON;
                    }
                    else if (tabControl1.TabPages.Count > 0)
                    {
                        tabControl1.SelectedIndex = 0;
                    }
                    break;
                default:
                    break;
            }

            IncarcaDateDinDB();

            PopuleazaControale();
        }

        private void IncarcaDateDinDB()
        {
            //incarcaListaDinFisier(FISIER_AGENTI, ref listaAgenti);

            //incarcaListaDinFisier(FISIER_CLIENTI, ref listaClienti);

            //incarcaListaDinFisier(FISIER_PROPRIETATI, ref listaProprietati);

            //incarcaListaDinFisier(FISIER_OFERTE, ref listaOferte);

            //incarcaListaDinFisier(FISIER_CERERI, ref listaCereri);

            IncarcaAgentiDinDB();
            IncarcaClientiDinDB();
            IncarcaProprietatiDinDB();
            IncarcaOferteDinDB();
            IncarcaCereriDinDB();
        }

        private void IncarcaCereriDinDB()
        {
            listaCereri.Clear();
            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    OleDbCommand cmd = new OleDbCommand("SELECT * FROM Cereri", conexiune);
                    OleDbDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        ClientRequest cerere = new ClientRequest
                        {
                            RequestId = Convert.ToInt32(reader["RequestId"]),
                            ClientId = Convert.ToInt32(reader["ClientIdRef"]),
                            DesiredPropertyType = (PropertyType)Enum.Parse(typeof(PropertyType), reader["TipProprietateDorit"].ToString()),
                            DesiredLocation = reader["LocatieDorita"].ToString(),
                            MinPrice = Convert.ToDecimal(reader["PretMin"]),
                            MaxPrice = Convert.ToDecimal(reader["PretMax"]),
                            MinArea = Convert.ToDouble(reader["SuprafataMin"]),
                            MinBedrooms = Convert.ToInt32(reader["NrDormitoareMin"]),
                            RequestDate = Convert.ToDateTime(reader["DataCererii"]),
                            Status = (RequestStatus)Enum.Parse(typeof(RequestStatus), reader["StatusCerere"].ToString())
                        };
                        listaCereri.Add(cerere);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la incarcarea cererilor: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void IncarcaOferteDinDB()
        {
            listaOferte.Clear();
            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    OleDbCommand cmd = new OleDbCommand("SELECT * FROM Oferte", conexiune);
                    OleDbDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        Offer oferta = new Offer
                        {
                            OfferId = Convert.ToInt32(reader["OfferId"]),
                            PropertyId = Convert.ToInt32(reader["PropertyIdRef"]),
                            ClientId = Convert.ToInt32(reader["ClientIdRef"]),
                            OfferAmount = Convert.ToDecimal(reader["SumaOferta"]),
                            OfferDate = Convert.ToDateTime(reader["DataOfertei"]),
                            Status = (OfferStatus)Enum.Parse(typeof(OfferStatus), reader["StatusOferta"].ToString())
                        };
                        listaOferte.Add(oferta);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la incarcarea ofertelor: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void IncarcaProprietatiDinDB()
        {
            listaProprietati.Clear();
            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    OleDbCommand cmd = new OleDbCommand("SELECT * FROM Proprietati", conexiune);
                    OleDbDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        Property prop = new Property
                        {
                            PropertyId = Convert.ToInt32(reader["PropertyId"]),
                            Address = reader["Adresa"].ToString(),
                            Price = Convert.ToDecimal(reader["Pret"]),
                            Area = Convert.ToDouble(reader["Suprafata"]),
                            NumberOfBedrooms = Convert.ToInt32(reader["NrDormitoare"]),
                            NumberOfBathrooms = Convert.ToInt32(reader["NrBai"]),
                            Description = reader["Descriere"].ToString(),
                            ListingDate = Convert.ToDateTime(reader["DataListarii"]),
                            Type = (PropertyType)Enum.Parse(typeof(PropertyType), reader["TipProprietate"].ToString()),
                            Status = (PropertyStatus)Enum.Parse(typeof(PropertyStatus), reader["StatusProprietate"].ToString()),
                            AgentId = Convert.ToInt32(reader["AgentID"]),
                            OwnerClientId = Convert.ToInt32(reader["ClientID"])
                        };
                        listaProprietati.Add(prop);
                    }
                    reader.Close();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la incarcarea proprietatilor: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void IncarcaClientiDinDB()
        {
            listaClienti.Clear();
            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    OleDbCommand cmd = new OleDbCommand("SELECT * FROM Clienti", conexiune);
                    OleDbDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        Client client = new Client
                        {
                            ClientId = Convert.ToInt32(reader["ClientID"]),
                            FirstName = reader["Nume"].ToString(),
                            LastName = reader["Prenume"].ToString(),
                            PhoneNumber = reader["Telefon"].ToString(),
                            Email = reader["Email"].ToString(),
                            Type = (ClientType)Enum.Parse(typeof(ClientType), reader["TipClient"].ToString())
                        };
                        listaClienti.Add(client);
                    }
                    reader.Close();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la incarcarea clientilor: {ex.Message}", "Eroare DB", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void IncarcaAgentiDinDB()
        {
            listaAgenti.Clear();
            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    OleDbCommand cmd = new OleDbCommand("SELECT AgentID, Nume, Prenume, Telefon, Email, DataAngajarii FROM Agenti", conexiune);
                    OleDbDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        Agent agent = new Agent
                        {
                            AgentId = Convert.ToInt32(reader["AgentID"]),
                            FirstName = reader["Nume"].ToString(),
                            LastName = reader["Prenume"].ToString(),
                            PhoneNumber = reader["Telefon"].ToString(),
                            Email = reader["Email"].ToString(),
                            HireDate = Convert.ToDateTime(reader["DataAngajarii"])
                        };
                        listaAgenti.Add(agent);
                    }
                    reader.Close();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la incarcarea agentilor din baza de date: {ex.Message}", "Eroare DB", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                // finally { conexiune.Close(); } // 'using' se ocupă de închidere
            }
        }

        private void incarcaListaDinFisier<T>(string numeFisier, ref List<T> lista)
        {
            if (!File.Exists(numeFisier)) return;

            try
            {
                string jsonString = File.ReadAllText(numeFisier);

                if (!string.IsNullOrEmpty(jsonString))
                {
                    lista = JsonSerializer.Deserialize<List<T>>(jsonString);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Eroare la incarcarea fisierului {numeFisier}: {ex.Message}");
            }
        }

        private void SalveazaDate()
        {
            salveazaListaInFisier(FISIER_AGENTI, listaAgenti);

            salveazaListaInFisier(FISIER_CLIENTI, listaClienti);

            salveazaListaInFisier(FISIER_PROPRIETATI, listaProprietati);

            salveazaListaInFisier(FISIER_OFERTE, listaOferte);

            salveazaListaInFisier(FISIER_CERERI, listaCereri);
        }

        private void salveazaListaInFisier<T>(string numeFisier, List<T> lista)
        {
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                string jsonString = JsonSerializer.Serialize(lista, options);
                File.WriteAllText(numeFisier, jsonString);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Eroare la salvarea fisierului {numeFisier}: {ex.Message}");
            }
        }

        private void PopuleazaControale()
        {
            cmbTipProprietate.DataSource = Enum.GetValues(typeof(PropertyType));
            cmbStatus.DataSource = Enum.GetValues(typeof(PropertyStatus));
            cmbTipClient.DataSource = Enum.GetValues(typeof(ClientType));
            cmbTipPropDorit.DataSource = Enum.GetValues(typeof(PropertyType));

            cmbAgentProprietate.DataSource = listaAgenti;
            cmbClientProprietar.DataSource = listaClienti;
            cmbClientOfertant.DataSource = listaClienti;
            cmbClientPentruCerere.DataSource = listaClienti;

            AfiseazaProprietati();
            AfiseazaAgenti();
            AfiseazaClienti();
            AfiseazaCereri();
        }

        private void AfiseazaProprietati()
        {
            lvProprietati.Items.Clear();

            foreach (Property prop in listaProprietati)
            {
                //caut numele agentului pe baza id-ului din proprietati
                Agent agentAsociat = listaAgenti.FirstOrDefault(a => a.AgentId == prop.AgentId);
                string numeAgent = agentAsociat != null ? $"{agentAsociat.FirstName} {agentAsociat.LastName}" : "N/A";

                ListViewItem item = new ListViewItem(prop.Address);
                item.SubItems.Add(prop.Type.ToString());
                item.SubItems.Add(prop.Price.ToString("C")); //formatez moneda
                item.SubItems.Add(prop.Area.ToString());
                item.SubItems.Add(prop.Status.ToString());
                item.SubItems.Add(numeAgent);

                item.Tag = prop;

                lvProprietati.Items.Add(item);
            }
        }

        private void AfiseazaAgenti()
        {
            lvAgenti.Items.Clear();

            foreach (Agent agent in listaAgenti)
            {
                ListViewItem item = new ListViewItem(new string[] { agent.FirstName, agent.LastName, agent.Email,
                    agent.PhoneNumber, agent.HireDate.ToShortDateString() });

                item.Tag = agent;

                lvAgenti.Items.Add(item);
            }
        }

        private void AfiseazaClienti()
        {
            lvClienti.Items.Clear();

            foreach (Client client in listaClienti)
            {
                ListViewItem item = new ListViewItem(new string[] { client.FirstName, client.LastName, client.Email,
                    client.PhoneNumber, client.Type.ToString()  });

                item.Tag = client;

                lvClienti.Items.Add(item);
            }
        }

        private void AfiseazaOfertePentruProprietate(Property proprietate)
        {
            if (proprietate == null) return;

            lblOfertePentruProprietatea.Text = $"Oferte pentru: {proprietate.Address}";
            lvOferteSpecifice.Items.Clear();

            var oferteFiltrate = listaOferte.Where(o => o.PropertyId == proprietate.PropertyId).ToList();

            foreach (Offer oferta in oferteFiltrate)
            {
                Client clientOfertanta = listaClienti.FirstOrDefault(c => c.ClientId == oferta.ClientId);
                string numeClient = clientOfertanta != null ? $"{clientOfertanta.FirstName} {clientOfertanta.LastName}" : "N/A";

                ListViewItem item = new ListViewItem(numeClient);
                item.SubItems.Add(oferta.OfferAmount.ToString("C"));
                item.SubItems.Add(oferta.OfferDate.ToShortDateString());
                item.SubItems.Add(oferta.Status.ToString());
                item.Tag = oferta;
                lvOferteSpecifice.Items.Add(item);
            }
        }
        private void AfiseazaCereri()
        {
            lvCereri.Items.Clear();
            foreach (ClientRequest req in listaCereri)
            {
                Client clientAsociat = listaClienti.FirstOrDefault(c => c.ClientId == req.ClientId);
                string numeClient = clientAsociat != null ? $"{clientAsociat.FirstName} {clientAsociat.LastName}" : "Client Sters/N/A";

                ListViewItem item = new ListViewItem(numeClient);
                item.SubItems.Add(req.DesiredPropertyType.ToString());
                item.SubItems.Add(req.DesiredLocation);
                item.SubItems.Add(req.MinPrice.ToString("C"));
                item.SubItems.Add(req.MaxPrice.ToString("C"));
                item.SubItems.Add(req.Status.ToString());
                item.Tag = req;
                lvCereri.Items.Add(item);
            }
        }

        private void PregatesteDateGraficTipuri()
        {
            distributieTipuriProprietati = new Dictionary<PropertyType, int>();

            foreach (PropertyType tip in Enum.GetValues(typeof(PropertyType)))
            {
                distributieTipuriProprietati[tip] = 0;
            }

            foreach (Property prop in listaProprietati)
            {
                if (distributieTipuriProprietati.ContainsKey(prop.Type))
                {
                    distributieTipuriProprietati[prop.Type]++;
                }
            }
        }

        private void DeseneazaGraficTipuriProprietati(Graphics g, Rectangle zonaDesenarePanou)
        {
            if (distributieTipuriProprietati == null || !distributieTipuriProprietati.Any(kvp => kvp.Value > 0))
            {
                string mesajGol = "Nu sunt date suficiente pentru grafic.";
                SizeF marimeMesaj = g.MeasureString(mesajGol, fontTextGrafic);
                g.DrawString(mesajGol, fontTextGrafic, Brushes.Black,
                             zonaDesenarePanou.Width / 2 - marimeMesaj.Width / 2,
                             zonaDesenarePanou.Height / 2 - marimeMesaj.Height / 2);
                return;
            }

            string titlu = "Distributia Proprietatilor pe Tip";
            SizeF marimeTitlu = g.MeasureString(titlu, fontTitluGrafic);
            float yCurent = 15;
            g.DrawString(titlu, fontTitluGrafic, new SolidBrush(culoareTextGrafic),
                zonaDesenarePanou.Width / 2 - marimeTitlu.Width / 2, yCurent);
            yCurent += marimeTitlu.Height + 20;

            int margineStanga = 60;
            int margineDreapta = 20;
            int margineSusPentruBare = (int)yCurent;
            int margineJos = 40;

            Rectangle rectGrafic = new Rectangle(
                margineStanga,
                margineSusPentruBare,
                zonaDesenarePanou.Width - margineStanga - margineDreapta,
                zonaDesenarePanou.Height - margineSusPentruBare - margineJos
            );

            if (rectGrafic.Width <= 20 || rectGrafic.Height <= 20) return;

            g.DrawLine(Pens.Black, rectGrafic.Left, rectGrafic.Bottom, rectGrafic.Right, rectGrafic.Bottom);
            g.DrawLine(Pens.Black, rectGrafic.Left, rectGrafic.Top, rectGrafic.Left, rectGrafic.Bottom);

            var tipuriCuValori = distributieTipuriProprietati.Where(kvp => kvp.Value > 0).ToList();
            if (tipuriCuValori.Count == 0) return;

            int nrBare = tipuriCuValori.Count;
            float latimeBara = (rectGrafic.Width * 0.6f) / nrBare;
            float spatiuIntreBare = (rectGrafic.Width * 0.4f) / (nrBare + 1);

            int valoareMaximaY = tipuriCuValori.Max(kvp => kvp.Value);
            if (valoareMaximaY == 0) valoareMaximaY = 1;

            float factorScalareY = (float)rectGrafic.Height / valoareMaximaY;

            Brush brushBara = new SolidBrush(culoareBaraGrafic);
            Brush brushText = new SolidBrush(culoareTextGrafic);

            for (int i = 0; i < nrBare; i++)
            {
                var pereche = tipuriCuValori[i];
                PropertyType tip = pereche.Key;
                int numarProprietati = pereche.Value;

                float inaltimeBaraCalculata = numarProprietati * factorScalareY;
                float inaltimeBara = (numarProprietati > 0 && inaltimeBaraCalculata < 1) ? 1 : inaltimeBaraCalculata;


                float xBara = rectGrafic.Left + spatiuIntreBare + i * (latimeBara + spatiuIntreBare);
                float yBara = rectGrafic.Bottom - inaltimeBara;

                RectangleF rectBara = new RectangleF(xBara, yBara, latimeBara, inaltimeBara);
                g.FillRectangle(brushBara, rectBara);

                string textValoare = numarProprietati.ToString();
                SizeF marimeTextValoare = g.MeasureString(textValoare, fontTextGrafic);
                g.DrawString(textValoare, fontTextGrafic, brushText,
                    xBara + latimeBara / 2 - marimeTextValoare.Width / 2,
                    yBara - marimeTextValoare.Height - 2);

                string textTip = tip.ToString();
                SizeF marimeTextTip = g.MeasureString(textTip, fontTextGrafic);
                float xTextTip = xBara + latimeBara / 2 - marimeTextTip.Width / 2;
                g.DrawString(textTip, fontTextGrafic, brushText, xTextTip, rectGrafic.Bottom + 5);
            }

            g.DrawString(valoareMaximaY.ToString(), fontTextGrafic, brushText, rectGrafic.Left - 30, rectGrafic.Top - fontTextGrafic.Height / 2);
            g.DrawString("0", fontTextGrafic, brushText, rectGrafic.Left - 15, rectGrafic.Bottom - fontTextGrafic.Height / 2);
        }

        private void btnAdaugaProprietate_Click(object sender, EventArgs e)
        {
            errorProviderProprietati.Clear();

            //Validare adresa

            if (string.IsNullOrWhiteSpace(txtAdresa.Text))
            {
                errorProviderProprietati.SetError(txtAdresa, "Adresa este obligatorie!");
                txtAdresa.Focus();
                return;
            }

            //Validare proprietate

            if (cmbTipProprietate.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbTipProprietate, "Va rugam selectati tipul proprietatii!");
                cmbTipProprietate.Focus();
                return;
            }

            //Validare status

            if (cmbStatus.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbStatus, "Va rugam selectati statusul proprietatii!");
                cmbStatus.Focus();
                return;
            }

            //Validare agent

            if (cmbAgentProprietate.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbAgentProprietate, "Va rugam selectati un agent responsabil!");
                cmbAgentProprietate.Focus();
                return;
            }

            //Validare proprietar

            if (cmbClientProprietar.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbClientProprietar, "Va rugam selectati clientul proprietar!");
                cmbClientProprietar.Focus();
                return;
            }

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "INSERT INTO Proprietati (Adresa, TipProprietate, StatusProprietate, Pret, Suprafata, NrDormitoare, NrBai, Descriere, DataListarii, AgentID, ClientID) " +
                                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("Adresa", OleDbType.LongVarChar).Value = txtAdresa.Text;
                    cmd.Parameters.Add("TipProprietate", OleDbType.VarChar).Value = cmbTipProprietate.Text;
                    cmd.Parameters.Add("StatusProprietate", OleDbType.VarChar).Value = cmbStatus.Text;
                    cmd.Parameters.Add("Pret", OleDbType.Currency).Value = numPret.Value;
                    cmd.Parameters.Add("Suprafata", OleDbType.Double).Value = (double)numSuprafata.Value;
                    cmd.Parameters.Add("NrDormitoare", OleDbType.Integer).Value = (int)numDormitoare.Value;
                    cmd.Parameters.Add("NrBai", OleDbType.Integer).Value = (int)numBai.Value;
                    cmd.Parameters.Add("Descriere", OleDbType.LongVarChar).Value = txtDescriere.Text;
                    cmd.Parameters.Add("DataListarii", OleDbType.Date).Value = DateTime.Now;
                    cmd.Parameters.Add("AgentID", OleDbType.Integer).Value = ((Agent)cmbAgentProprietate.SelectedItem).AgentId;
                    cmd.Parameters.Add("ClientID", OleDbType.Integer).Value = ((Client)cmbClientProprietar.SelectedItem).ClientId;

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Proprietate adaugata cu succes!", "Succes");
                        IncarcaProprietatiDinDB();
                        AfiseazaProprietati();

                        txtAdresa.Clear();
                        numPret.Value = 0;
                        numSuprafata.Value = 0;
                        numDormitoare.Value = 0;
                        numBai.Value = 0;
                        cmbTipProprietate.SelectedIndex = -1;
                        cmbStatus.SelectedIndex = -1;
                        cmbAgentProprietate.SelectedIndex = -1;
                        cmbClientProprietar.SelectedIndex = -1;
                        txtDescriere.Clear();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la adăugarea proprietății: {ex.Message}", "Eroare DB");
                }
            }

            //Property proprietateNoua = new Property()
            //{
            //    Address = txtAdresa.Text,
            //    Price = numPret.Value,
            //    Area = (double)numSuprafata.Value,
            //    NumberOfBedrooms = (int)numDormitoare.Value,
            //    NumberOfBathrooms = (int)numBai.Value,
            //    Description = txtDescriere.Text,
            //    Type = (PropertyType)cmbTipProprietate.SelectedItem,
            //    Status = (PropertyStatus)cmbStatus.SelectedItem,
            //    AgentId = ((Agent)cmbAgentProprietate.SelectedItem).AgentId,
            //    OwnerClientId = ((Client)cmbClientProprietar.SelectedItem).ClientId
            //};

            //listaProprietati.Add(proprietateNoua);

            //AfiseazaProprietati();

            //txtAdresa.Clear();
            //numPret.Value = 0;
            //numSuprafata.Value = 0;
            //numDormitoare.Value = 0;
            //numBai.Value = 0;
            //cmbTipProprietate.SelectedIndex = -1;
            //cmbStatus.SelectedIndex = -1;
            //cmbAgentProprietate.SelectedIndex = -1;
            //cmbClientProprietar.SelectedIndex = -1;
            //txtDescriere.Clear();

            //txtAdresa.Focus();
        }

        private void btnAdaugaAgent_Click(object sender, EventArgs e)
        {
            errorProviderProprietati.Clear();

            //Validare nume

            if (string.IsNullOrWhiteSpace(txtNumeAgent.Text))
            {
                errorProviderProprietati.SetError(txtNumeAgent, "Numele agentului este obligatoriu!");
                txtNumeAgent.Focus();
                return;
            }

            //Validare prenume

            if (string.IsNullOrWhiteSpace(txtPrenumeAgent.Text))
            {
                errorProviderProprietati.SetError(txtPrenumeAgent, "Prenumele agentului este obligatoriu!");
                txtPrenumeAgent.Focus();
                return;
            }

            //Validare email

            if (string.IsNullOrWhiteSpace(txtEmailAgent.Text) || !txtEmailAgent.Text.Contains("@"))
            {
                errorProviderProprietati.SetError(txtEmailAgent, "Adresa de email este invalida!");
                txtEmailAgent.Focus();
                return;
            }

            //Validare telefon

            if (string.IsNullOrWhiteSpace(txtTelefonAgent.Text) || !txtTelefonAgent.Text.All(char.IsDigit)
                || txtTelefonAgent.Text.Length != 10)
            {
                errorProviderProprietati.SetError(txtTelefonAgent, "Numarul de telefon trebuie sa contina exact 10 cifre!");
                txtTelefonAgent.Focus();
                return;
            }

            Agent agentNou = new Agent
            {
                FirstName = txtNumeAgent.Text,
                LastName = txtPrenumeAgent.Text,
                Email = txtEmailAgent.Text,
                PhoneNumber = txtTelefonAgent.Text,
                HireDate = DateTime.Now
            };

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "INSERT INTO Agenti (Nume, Prenume, Telefon, Email, DataAngajarii) " +
                                   "VALUES (?, ?, ?, ?, ?)";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("Nume", OleDbType.VarChar).Value = agentNou.FirstName;
                    cmd.Parameters.Add("Prenume", OleDbType.VarChar).Value = agentNou.LastName;
                    cmd.Parameters.Add("Telefon", OleDbType.VarChar).Value = agentNou.PhoneNumber;
                    cmd.Parameters.Add("Email", OleDbType.VarChar).Value = agentNou.Email;
                    cmd.Parameters.Add("DataAngajarii", OleDbType.Date).Value = agentNou.HireDate;

                    int rezultat = cmd.ExecuteNonQuery();

                    if (rezultat > 0)
                    {
                        IncarcaAgentiDinDB();
                        AfiseazaAgenti();

                        cmbAgentProprietate.DataSource = null;
                        cmbAgentProprietate.DataSource = listaAgenti;

                        txtNumeAgent.Clear();
                        txtPrenumeAgent.Clear();
                        txtEmailAgent.Clear();
                        txtTelefonAgent.Clear();
                        txtNumeAgent.Focus();

                        MessageBox.Show("Agent adaugat cu succes in baza de date!", "Succes", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    else
                    {
                        MessageBox.Show("Agentul nu a putut fi adaugat in baza de date.", "Eșec Adăugare", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    }
                }
                catch (OleDbException oleEx)
                {
                    MessageBox.Show($"Eroare OLEDB la adaugarea agentului: {oleEx.Message}\n" +
                                    $"Error Code: {oleEx.ErrorCode}", "Eroare DB", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare generala la adaugarea agentului in baza de date: {ex.Message}", "Eroare DB", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                // `using` se va ocupa de conexiune.Close() automat

                //listaAgenti.Add(agentNou);

                //AfiseazaAgenti();

                //cmbAgentProprietate.DataSource = null;
                //cmbAgentProprietate.DataSource = listaAgenti;

                //txtNumeAgent.Clear();
                //txtPrenumeAgent.Clear();
                //txtEmailAgent.Clear();
                //txtTelefonAgent.Clear();

                //txtNumeAgent.Focus();
            }
        }

        private void FormularPrincipal_FormClosing(object sender, FormClosingEventArgs e)
        {
            SalveazaDate();
        }

        private void btnAdaugaClient_Click(object sender, EventArgs e)
        {
            errorProviderProprietati.Clear();

            //Validare nume
            if (string.IsNullOrWhiteSpace(txtNumeClient.Text))
            {
                errorProviderProprietati.SetError(txtNumeClient, "Numele clientului este obligatoriu!");
                txtNumeClient.Focus();
                return;
            }

            //Validare prenume
            if (string.IsNullOrWhiteSpace(txtPrenumeClient.Text))
            {
                errorProviderProprietati.SetError(txtPrenumeClient, "Prenumele clientului este obligatoriu!");
                txtPrenumeClient.Focus();
                return;
            }

            //Validare email
            if (string.IsNullOrWhiteSpace(txtEmailClient.Text) || !txtEmailClient.Text.Contains("@"))
            {
                errorProviderProprietati.SetError(txtEmailClient, "Adresa de email este invalida!");
                txtEmailClient.Focus();
                return;
            }

            //Validare telefon 
            if (string.IsNullOrWhiteSpace(txtTelefonClient.Text) || !txtTelefonClient.Text.All(char.IsDigit) ||
                txtTelefonClient.Text.Length != 10)
            {
                errorProviderProprietati.SetError(txtTelefonClient, "Numarul de telefon trebuie sa contina exact 10 cifre!");
                txtTelefonClient.Focus();
                return;
            }

            //Validare tip client
            if (cmbTipClient.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbTipClient, "Va rugam selectati tipul clientului!");
                cmbTipClient.Focus();
                return;
            }

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "INSERT INTO Clienti (Nume, Prenume, Telefon, Email, TipClient) VALUES (?, ?, ?, ?, ?)";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("Nume", OleDbType.VarChar).Value = txtNumeClient.Text;
                    cmd.Parameters.Add("Prenume", OleDbType.VarChar).Value = txtPrenumeClient.Text;
                    cmd.Parameters.Add("Telefon", OleDbType.VarChar).Value = txtTelefonClient.Text;
                    cmd.Parameters.Add("Email", OleDbType.VarChar).Value = txtEmailClient.Text;
                    cmd.Parameters.Add("TipClient", OleDbType.VarChar).Value = cmbTipClient.Text;

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Client adăugat cu succes!", "Succes");
                        IncarcaClientiDinDB();
                        AfiseazaClienti();

                        txtNumeClient.Clear();
                        txtPrenumeClient.Clear();
                        txtEmailClient.Clear();
                        txtTelefonClient.Clear();
                        cmbTipClient.SelectedIndex = -1;
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la adăugarea clientului: {ex.Message}", "Eroare DB");
                }
            }

            //Client clientNou = new Client
            //{
            //    FirstName = txtNumeClient.Text,
            //    LastName = txtPrenumeClient.Text,
            //    Email = txtEmailClient.Text,
            //    PhoneNumber = txtTelefonClient.Text,
            //    Type = (ClientType)cmbTipClient.SelectedItem
            //};

            //listaClienti.Add(clientNou);

            //AfiseazaClienti();

            //cmbClientProprietar.DataSource = null;
            //cmbClientProprietar.DataSource = listaClienti;

            //txtNumeClient.Clear();
            //txtPrenumeClient.Clear();
            //txtEmailClient.Clear();
            //txtTelefonClient.Clear();
            //cmbTipClient.SelectedIndex = -1;

            //txtNumeClient.Focus();
        }

        private void lvProprietati_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count > 0)
            {
                ListViewItem itemSelectat = lvProprietati.SelectedItems[0];

                Property proprietateSelectata = (Property)itemSelectat.Tag;

                txtAdresa.Text = proprietateSelectata.Address;
                numPret.Value = proprietateSelectata.Price;
                numSuprafata.Value = (decimal)proprietateSelectata.Area;
                numDormitoare.Value = proprietateSelectata.NumberOfBedrooms;
                numBai.Value = proprietateSelectata.NumberOfBathrooms;
                txtDescriere.Text = proprietateSelectata.Description;

                cmbTipProprietate.SelectedItem = proprietateSelectata.Type;
                cmbStatus.SelectedItem = proprietateSelectata.Status;

                cmbAgentProprietate.SelectedItem = listaAgenti.FirstOrDefault(a => a.AgentId == proprietateSelectata.AgentId);
                cmbClientProprietar.SelectedItem = listaClienti.FirstOrDefault(c => c.ClientId == proprietateSelectata.OwnerClientId);
            }
        }

        private void btnModificaProprietate_Click(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam sa selectati o proprietate din lista pentru a o modifica.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            errorProviderProprietati.Clear();

            if (string.IsNullOrWhiteSpace(txtAdresa.Text))
            {
                errorProviderProprietati.SetError(txtAdresa, "Adresa este obligatorie!");
                txtAdresa.Focus();
                return;
            }

            if (cmbTipProprietate.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbTipProprietate, "Selectati tipul!");
                cmbTipProprietate.Focus();
                return;
            }

            if (cmbAgentProprietate.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbAgentProprietate, "Selectati agentul!");
                cmbAgentProprietate.Focus();
                return;
            }

            if (cmbClientProprietar.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbClientProprietar, "Selectati proprietarul!");
                cmbClientProprietar.Focus();
                return;
            }

            if (cmbStatus.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbStatus, "Va rugam selectati statusul proprietatii!");
                cmbStatus.Focus();
                return;
            }

            Property proprietateDeModificat = (Property)lvProprietati.SelectedItems[0].Tag;

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "UPDATE Proprietati SET Adresa = ?, TipProprietate = ?, StatusProprietate = ?, Pret = ?, Suprafata = ?, NrDormitoare = ?, NrBai = ?, Descriere = ?, AgentID = ?, ClientID = ? WHERE PropertyId = ?";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("Adresa", OleDbType.LongVarChar).Value = txtAdresa.Text;
                    cmd.Parameters.Add("TipProprietate", OleDbType.VarChar).Value = cmbTipProprietate.Text;
                    cmd.Parameters.Add("StatusProprietate", OleDbType.VarChar).Value = cmbStatus.Text;
                    cmd.Parameters.Add("Pret", OleDbType.Currency).Value = numPret.Value;
                    cmd.Parameters.Add("Suprafata", OleDbType.Double).Value = (double)numSuprafata.Value;
                    cmd.Parameters.Add("NrDormitoare", OleDbType.Integer).Value = (int)numDormitoare.Value;
                    cmd.Parameters.Add("NrBai", OleDbType.Integer).Value = (int)numBai.Value;
                    cmd.Parameters.Add("Descriere", OleDbType.LongVarChar).Value = txtDescriere.Text;
                    cmd.Parameters.Add("AgentID", OleDbType.Integer).Value = ((Agent)cmbAgentProprietate.SelectedItem).AgentId;
                    cmd.Parameters.Add("ClientID", OleDbType.Integer).Value = ((Client)cmbClientProprietar.SelectedItem).ClientId;
                    cmd.Parameters.Add("PropertyId", OleDbType.Integer).Value = proprietateDeModificat.PropertyId;

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Proprietate modificata cu succes!", "Succes");
                        IncarcaProprietatiDinDB();
                        AfiseazaProprietati();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la modificarea proprietatii: {ex.Message}", "Eroare DB");
                }
            }

            //proprietateDeModificat.Address = txtAdresa.Text;
            //proprietateDeModificat.Price = numPret.Value;
            //proprietateDeModificat.Area = (double)numSuprafata.Value;
            //proprietateDeModificat.NumberOfBedrooms = (int)numDormitoare.Value;
            //proprietateDeModificat.NumberOfBathrooms = (int)numBai.Value;
            //proprietateDeModificat.Description = txtDescriere.Text;
            //proprietateDeModificat.Type = (PropertyType)cmbTipProprietate.SelectedItem;
            //proprietateDeModificat.Status = (PropertyStatus)cmbStatus.SelectedItem;
            //proprietateDeModificat.AgentId = ((Agent)cmbAgentProprietate.SelectedItem).AgentId;
            //proprietateDeModificat.OwnerClientId = ((Client)cmbClientProprietar.SelectedItem).ClientId;

            //AfiseazaProprietati();

            //MessageBox.Show("Proprietatea a fost modificată cu succes!", "Succes", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void lvAgenti_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvAgenti.SelectedItems.Count > 0)
            {
                Agent agentSelectat = (Agent)lvAgenti.SelectedItems[0].Tag;

                txtNumeAgent.Text = agentSelectat.FirstName;
                txtPrenumeAgent.Text = agentSelectat.LastName;
                txtEmailAgent.Text = agentSelectat.Email;
                txtTelefonAgent.Text = agentSelectat.PhoneNumber;
            }
        }

        private void btnModificaAgent_Click(object sender, EventArgs e)
        {
            if (lvAgenti.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam sa selectati un agent din lista pentru a-l modifica.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            errorProviderProprietati.Clear();

            if (string.IsNullOrWhiteSpace(txtNumeAgent.Text))
            {
                errorProviderProprietati.SetError(txtNumeAgent, "Numele este obligatoriu!");
                txtNumeAgent.Focus();
                return;
            }

            if (string.IsNullOrWhiteSpace(txtPrenumeAgent.Text))
            {
                errorProviderProprietati.SetError(txtPrenumeAgent, "Prenumele este obligatoriu!");
                txtPrenumeAgent.Focus();
                return;
            }

            if (string.IsNullOrWhiteSpace(txtEmailAgent.Text) || !txtEmailAgent.Text.Contains("@"))
            {
                errorProviderProprietati.SetError(txtEmailAgent, "Email invalid!");
                txtEmailAgent.Focus();
                return;
            }

            if (string.IsNullOrWhiteSpace(txtTelefonAgent.Text) || !txtTelefonAgent.Text.All(char.IsDigit)
                || txtTelefonAgent.Text.Length != 10)
            {
                errorProviderProprietati.SetError(txtTelefonAgent, "Numarul de telefon trebuie sa contina exact 10 cifre!");
                txtTelefonAgent.Focus();
                return;
            }

            Agent agentDeModificat = (Agent)lvAgenti.SelectedItems[0].Tag;

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "UPDATE Agenti SET Nume = ?, Prenume = ?, Telefon = ?, Email = ?, DataAngajarii = ? WHERE AgentID = ?";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("Nume", OleDbType.VarChar).Value = txtNumeAgent.Text;
                    cmd.Parameters.Add("Prenume", OleDbType.VarChar).Value = txtPrenumeAgent.Text;
                    cmd.Parameters.Add("Telefon", OleDbType.VarChar).Value = txtTelefonAgent.Text;
                    cmd.Parameters.Add("Email", OleDbType.VarChar).Value = txtEmailAgent.Text;
                    cmd.Parameters.Add("DataAngajarii", OleDbType.Date).Value = agentDeModificat.HireDate; // Păstrăm data angajării originală
                    cmd.Parameters.Add("AgentID", OleDbType.Integer).Value = agentDeModificat.AgentId; // Acum este int

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Agent modificat cu succes!", "Succes");
                        IncarcaAgentiDinDB();
                        AfiseazaAgenti();
                        cmbAgentProprietate.DataSource = null;
                        cmbAgentProprietate.DataSource = listaAgenti;
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la modificarea agentului: {ex.Message}", "Eroare DB");
                }
            }

            //agentDeModificat.FirstName = txtNumeAgent.Text;
            //agentDeModificat.LastName = txtPrenumeAgent.Text;
            //agentDeModificat.Email = txtEmailAgent.Text;
            //agentDeModificat.PhoneNumber = txtTelefonAgent.Text;

            //AfiseazaAgenti();

            //cmbAgentProprietate.DataSource = null;
            //cmbAgentProprietate.DataSource = listaAgenti;

            //MessageBox.Show("Datele agentului au fost modificate cu succes!", "Succes", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void btnStergeProprietate_Click(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam sa selectati o proprietate din lista pentru a o sterge.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            Property proprietateDeSters = (Property)lvProprietati.SelectedItems[0].Tag;

            if (MessageBox.Show($"Sunteti sigur ca stergeti proprietatea de la adresa '{proprietateDeSters.Address}'?", "Confirmare Stergere", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes)
            {
                using (OleDbConnection conexiune = new OleDbConnection(connString))
                {
                    try
                    {
                        conexiune.Open();
                        string query = "DELETE FROM Proprietati WHERE PropertyId = ?";
                        OleDbCommand cmd = new OleDbCommand(query, conexiune);
                        cmd.Parameters.Add("PropertyId", OleDbType.Integer).Value = proprietateDeSters.PropertyId;

                        if (cmd.ExecuteNonQuery() > 0)
                        {
                            MessageBox.Show("Proprietate ștearsă cu succes!", "Succes");
                            IncarcaProprietatiDinDB();
                            AfiseazaProprietati();

                            txtAdresa.Clear();
                            txtDescriere.Clear();
                            numPret.Value = 0;
                            numSuprafata.Value = 0;
                            numDormitoare.Value = 0;
                            numBai.Value = 0;
                            cmbTipProprietate.SelectedIndex = -1;
                            cmbStatus.SelectedIndex = -1;
                            cmbAgentProprietate.SelectedIndex = -1;
                            cmbClientProprietar.SelectedIndex = -1;
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Eroare la stergerea proprietatii: {ex.Message}", "Eroare DB");
                    }
                }
            }

            //DialogResult rezultat = MessageBox.Show(
            //    $"Sunteti sigur ca doriti sa stergeti proprietatea de la adresa '{proprietateDeSters.Address}'?",
            //    "Confirmare Stergere",
            //    MessageBoxButtons.YesNo,
            //    MessageBoxIcon.Warning);

            //if (rezultat == DialogResult.Yes)
            //{
            //    listaProprietati.Remove(proprietateDeSters);

            //    AfiseazaProprietati();

            //    txtAdresa.Clear();
            //    txtDescriere.Clear();
            //    numPret.Value = 0;
            //    numSuprafata.Value = 0;
            //    numDormitoare.Value = 0;
            //    numBai.Value = 0;
            //    cmbTipProprietate.SelectedIndex = -1;
            //    cmbStatus.SelectedIndex = -1;
            //    cmbAgentProprietate.SelectedIndex = -1;
            //    cmbClientProprietar.SelectedIndex = -1;
            //}
        }

        private void btnStergeAgent_Click(object sender, EventArgs e)
        {
            if (lvAgenti.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam sa selectati un agent din lista pentru a-l sterge.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            Agent agentDeSters = (Agent)lvAgenti.SelectedItems[0].Tag;

            if (MessageBox.Show($"Sunteti sigur ca doriti sa stergeti agentul '{agentDeSters.FirstName} {agentDeSters.LastName}'?", "Confirmare Stergere", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes)
            {
                using (OleDbConnection conexiune = new OleDbConnection(connString))
                {
                    try
                    {
                        conexiune.Open();
                        string query = "DELETE FROM Agenti WHERE AgentId = ?";
                        OleDbCommand cmd = new OleDbCommand(query, conexiune);
                        cmd.Parameters.Add("AgentID", OleDbType.Integer).Value = agentDeSters.AgentId; 

                        if (cmd.ExecuteNonQuery() > 0)
                        {
                            MessageBox.Show("Agent sters cu succes!", "Succes");
                            IncarcaAgentiDinDB();
                            AfiseazaAgenti();
                            cmbAgentProprietate.DataSource = null;
                            cmbAgentProprietate.DataSource = listaAgenti;

                            txtNumeAgent.Clear();
                            txtPrenumeAgent.Clear();
                            txtEmailAgent.Clear();
                            txtTelefonAgent.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Eroare la stergerea agentului: {ex.Message}", "Eroare DB");
                    }
                }
            }

            //DialogResult rezultat = MessageBox.Show(
            //    $"Sunteti sigur ca doriti sa stergeti agentul '{agentDeSters.FirstName} {agentDeSters.LastName}'?",
            //    "Confirmare Stergere",
            //    MessageBoxButtons.YesNo,
            //    MessageBoxIcon.Warning);

            //if (rezultat == DialogResult.Yes)
            //{
            //    listaAgenti.Remove(agentDeSters);

            //    AfiseazaAgenti();

            //    cmbAgentProprietate.DataSource = null;
            //    cmbAgentProprietate.DataSource = listaAgenti;

            //    txtNumeAgent.Clear();
            //    txtPrenumeAgent.Clear();
            //    txtEmailAgent.Clear();
            //    txtTelefonAgent.Clear();
            //    txtNumeAgent.Focus();
            //}
        }

        private void marcheazaCaVandutToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count > 0)
            {
                Property proprietateSelectata = (Property)lvProprietati.SelectedItems[0].Tag;

                if (proprietateSelectata.Status == PropertyStatus.ForSale)
                {
                    proprietateSelectata.Status = PropertyStatus.Sold;
                    AfiseazaProprietati();
                    MessageBox.Show($"Proprietatea de la adresa '{proprietateSelectata.Address}' a fost marcata ca Vanduta.", "Status Modificat", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    MessageBox.Show("Aceasta proprietate nu poate fi marcată ca 'Vanduta' deoarece statusul curent nu este 'De Vanzare'.", "Actiune Invalida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
            else
            {
                MessageBox.Show("Va rugam selectati o proprietate din lista.", "Nicio Selectie", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void marcheazaCaInchiriatToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count > 0)
            {
                Property proprietateSelectata = (Property)lvProprietati.SelectedItems[0].Tag;

                if (proprietateSelectata.Status == PropertyStatus.ForRent)
                {
                    proprietateSelectata.Status = PropertyStatus.Rented;
                    AfiseazaProprietati();
                    MessageBox.Show($"Proprietatea de la adresa '{proprietateSelectata.Address}' a fost marcata ca Inchiriata.", "Status Modificat", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    MessageBox.Show("Aceasta proprietate nu poate fi marcata ca 'Inchiriata' deoarece statusul curent nu este 'De Inchiriat'.", "Actiune Invalida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
            else
            {
                MessageBox.Show("Va rugam selectati o proprietate din lista.", "Nicio Selectie", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void adaugaOfertaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count > 0)
            {
                proprietateSelectataPentruOferta = (Property)lvProprietati.SelectedItems[0].Tag;

                if (proprietateSelectataPentruOferta != null)
                {
                    if (proprietateSelectataPentruOferta.Status == PropertyStatus.Sold ||
                proprietateSelectataPentruOferta.Status == PropertyStatus.Rented ||
                proprietateSelectataPentruOferta.Status == PropertyStatus.Unavailable)
                    {
                        MessageBox.Show(
                            $"Proprietatea selectata de la adresa '{proprietateSelectataPentruOferta.Address}' " +
                            $"nu mai este disponibila pentru oferte (status curent: {proprietateSelectataPentruOferta.Status}).",
                            "Proprietate Indisponibila",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Warning);

                        proprietateSelectataPentruOferta = null;
                        return;
                    }

                    lblProprietatePentruOferta.Text = $"Ofertă pentru: {proprietateSelectataPentruOferta.Address}";

                    cmbClientOfertant.SelectedIndex = -1;
                    numSumaOferita.Value = 0;

                    tabControl1.SelectedTab = tabAdaugaOferta;
                    cmbClientOfertant.Focus();
                }
            }
            else
            {
                MessageBox.Show("Va rugam selectati o proprietate.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void btnSalveazaOferta_Click(object sender, EventArgs e)
        {
            if (proprietateSelectataPentruOferta == null)
            {
                MessageBox.Show("Eroare: Nu este selectata nicio proprietate pentru oferta.", "Eroare");
                tabControl1.SelectedTab = tabProprietati;
                return;
            }

            if (cmbClientOfertant.SelectedItem == null)
            {
                errorProviderProprietati.SetError(cmbClientOfertant, "Selectati un client!");
                return;
            }

            errorProviderProprietati.Clear();

            Offer ofertaNoua = new Offer
            {
                PropertyId = proprietateSelectataPentruOferta.PropertyId,
                ClientId = ((Client)cmbClientOfertant.SelectedItem).ClientId,
                OfferAmount = numSumaOferita.Value
            };

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "INSERT INTO Oferte (PropertyIdRef, ClientIdRef, SumaOferta, DataOfertei, StatusOferta) " +
                                   "VALUES (?, ?, ?, ?, ?)";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("PropertyIdRef", OleDbType.Integer).Value = ofertaNoua.PropertyId;
                    cmd.Parameters.Add("ClientIdRef", OleDbType.Integer).Value = ofertaNoua.ClientId;
                    cmd.Parameters.Add("SumaOferta", OleDbType.Currency).Value = ofertaNoua.OfferAmount;
                    cmd.Parameters.Add("DataOfertei", OleDbType.Date).Value = ofertaNoua.OfferDate;
                    cmd.Parameters.Add("StatusOferta", OleDbType.VarChar).Value = ofertaNoua.Status.ToString();

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Oferta a fost adaugata cu succes!", "Succes");
                        IncarcaOferteDinDB();

                        proprietateSelectataPentruOferta = null;
                        lblProprietatePentruOferta.Text = "Oferta pentru: -";
                        cmbClientOfertant.SelectedIndex = -1;
                        numSumaOferita.Value = 0;
                        if (this.modDeschidereFormular == "ModCereriOferte")
                            tabControl1.SelectedTab = tabCereri;
                        else
                            tabControl1.SelectedTab = tabProprietati;
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la adaugarea ofertei: {ex.Message}", "Eroare DB");
                }
            }

            //listaOferte.Add(ofertaNoua);
            //MessageBox.Show("Oferta a fost adaugata cu succes!", "Succes");

            //proprietateSelectataPentruOferta = null;
            //lblProprietatePentruOferta.Text = "Ofertă pentru: -";
            //cmbClientOfertant.SelectedIndex = -1;
            //numSumaOferita.Value = 0;

            //if (this.modDeschidereFormular == "ModCereriOferte")
            //{
            //    if (tabControl1.TabPages.Contains(tabCereri))
            //    {
            //        tabControl1.SelectedTab = tabCereri;
            //    }
            //    else if (tabControl1.TabPages.Count > 0)
            //    {
            //        tabControl1.SelectedIndex = 0;
            //    }
            //}
            //else
            //{
            //    if (tabControl1.TabPages.Contains(tabProprietati))
            //    {
            //        tabControl1.SelectedTab = tabProprietati;
            //    }
            //    else if (tabControl1.TabPages.Count > 0)
            //    {
            //        tabControl1.SelectedIndex = 0;
            //    }
            //}
        }

        private void btnAnuleazaOferta_Click(object sender, EventArgs e)
        {
            cmbClientOfertant.SelectedIndex = -1;
            numSumaOferita.Value = 0;
            lblProprietatePentruOferta.Text = "Ofertă pentru: -";

            errorProviderProprietati.SetError(cmbClientOfertant, null);
            errorProviderProprietati.SetError(numSumaOferita, null);

            proprietateSelectataPentruOferta = null;

            if (this.modDeschidereFormular == "ModCereriOferte")
            {
                if (tabControl1.TabPages.Contains(tabCereri))
                {
                    tabControl1.SelectedTab = tabCereri;
                }
                else if (tabControl1.TabPages.Count > 0)
                {
                    tabControl1.SelectedIndex = 0;
                }
            }
            else
            {
                if (tabControl1.TabPages.Contains(tabProprietati))
                {
                    tabControl1.SelectedTab = tabProprietati;
                }
                else if (tabControl1.TabPages.Count > 0)
                {
                    tabControl1.SelectedIndex = 0;
                }
            }
        }

        private void vizualizeazaOferteToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvProprietati.SelectedItems.Count > 0)
            {
                Property proprietateSelectata = (Property)lvProprietati.SelectedItems[0].Tag;
                if (proprietateSelectata != null)
                {
                    AfiseazaOfertePentruProprietate(proprietateSelectata);
                    tabControl1.SelectedTab = tabVizualizeazaOferte;
                }
            }
            else
            {
                MessageBox.Show("Va rugam selectati o proprietate.", "Nicio selectie");
            }
        }

        private void acceptaOfertaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvOferteSpecifice.SelectedItems.Count == 0) return;

            Offer ofertaSelectata = (Offer)lvOferteSpecifice.SelectedItems[0].Tag;
            Property proprietateAsociata = listaProprietati.FirstOrDefault(p => p.PropertyId == ofertaSelectata.PropertyId);

            if (proprietateAsociata == null) return;
            if (proprietateAsociata.Status != PropertyStatus.ForSale && proprietateAsociata.Status != PropertyStatus.ForRent)
            {
                MessageBox.Show("Aceasta proprietate nu mai este disponibila.", "Indisponibil");
                return;
            }

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string queryUpdateOffer = "UPDATE Oferte SET StatusOferta = ? WHERE OfferId = ?";
                    OleDbCommand cmdUpdateOffer = new OleDbCommand(queryUpdateOffer, conexiune);
                    cmdUpdateOffer.Parameters.Add("StatusOferta", OleDbType.VarChar).Value = OfferStatus.Accepted.ToString();
                    cmdUpdateOffer.Parameters.Add("OfferId", OleDbType.Integer).Value = ofertaSelectata.OfferId;
                    cmdUpdateOffer.ExecuteNonQuery();

                    string newStatusProp = (proprietateAsociata.Status == PropertyStatus.ForSale) ? PropertyStatus.Sold.ToString() : PropertyStatus.Rented.ToString();
                    string queryUpdateProp = "UPDATE Proprietati SET StatusProprietate = ? WHERE PropertyId = ?";
                    OleDbCommand cmdUpdateProp = new OleDbCommand(queryUpdateProp, conexiune);
                    cmdUpdateProp.Parameters.Add("StatusProprietate", OleDbType.VarChar).Value = newStatusProp;
                    cmdUpdateProp.Parameters.Add("PropertyId", OleDbType.Integer).Value = proprietateAsociata.PropertyId;
                    cmdUpdateProp.ExecuteNonQuery();

                    string queryRejectOthers = "UPDATE Oferte SET StatusOferta = ? WHERE PropertyId = ? AND OfferId <> ?";
                    OleDbCommand cmdReject = new OleDbCommand(queryRejectOthers, conexiune);
                    cmdReject.Parameters.Add("StatusOferta", OleDbType.VarChar).Value = OfferStatus.Rejected.ToString();
                    cmdReject.Parameters.Add("PropertyId", OleDbType.Integer).Value = proprietateAsociata.PropertyId;
                    cmdReject.Parameters.Add("OfferId", OleDbType.Integer).Value = ofertaSelectata.OfferId;
                    cmdReject.ExecuteNonQuery();

                    ClientRequest cerereClient = listaCereri.FirstOrDefault(cr => cr.ClientId == ofertaSelectata.ClientId && cr.Status == RequestStatus.Active);
                    if (cerereClient != null) { cerereClient.Status = RequestStatus.Fulfilled; }

                    IncarcaDateDinDB();
                    AfiseazaProprietati();
                    AfiseazaOfertePentruProprietate(proprietateAsociata);
                    AfiseazaCereri(); 

                    MessageBox.Show("Oferta a fost acceptata cu succes!", "Succes");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la acceptarea ofertei: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void respingeOfertaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvOferteSpecifice.SelectedItems.Count == 0) return;
            Offer ofertaSelectata = (Offer)lvOferteSpecifice.SelectedItems[0].Tag;

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "UPDATE Oferte SET StatusOferta = ? WHERE OfferId = ?";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);
                    cmd.Parameters.Add("StatusOferta", OleDbType.VarChar).Value = OfferStatus.Rejected.ToString();
                    cmd.Parameters.Add("OfferId", OleDbType.Integer).Value = ofertaSelectata.OfferId;
                    cmd.ExecuteNonQuery();

                    IncarcaOferteDinDB();
                    Property propAsociata = listaProprietati.FirstOrDefault(p => p.PropertyId == ofertaSelectata.PropertyId);
                    AfiseazaOfertePentruProprietate(propAsociata);
                    MessageBox.Show("Oferta a fost respinsa.", "Status Modificat");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void marcheazaCaRetrasaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (lvOferteSpecifice.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam selectati o oferta pentru a o marca drept retrasa.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            Offer ofertaSelectata = (Offer)lvOferteSpecifice.SelectedItems[0].Tag;

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "UPDATE Oferte SET StatusOferta = ? WHERE OfferId = ?";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("StatusOferta", OleDbType.VarChar).Value = OfferStatus.Withdrawn.ToString();
                    cmd.Parameters.Add("OfferId", OleDbType.Integer).Value = ofertaSelectata.OfferId;

                    int rezultat = cmd.ExecuteNonQuery();

                    if (rezultat > 0)
                    {

                        IncarcaOferteDinDB();

                        Property proprietateAsociata = listaProprietati.FirstOrDefault(p => p.PropertyId == ofertaSelectata.PropertyId);

                        if (proprietateAsociata != null)
                        {
                            AfiseazaOfertePentruProprietate(proprietateAsociata);
                        }

                        MessageBox.Show("Oferta a fost marcata ca retrasa.", "Status Modificat", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la actualizarea ofertei: {ex.Message}", "Eroare DB", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void btnAdaugaCerere_Click(object sender, EventArgs e)
        {
            errorProviderProprietati.Clear();

            if (cmbClientPentruCerere.SelectedItem == null)
            {
                errorProviderProprietati.SetError(cmbClientPentruCerere, "Selectati un client!");
                cmbClientPentruCerere.Focus();
                return;
            }

            if (cmbTipPropDorit.SelectedItem == null)
            {
                errorProviderProprietati.SetError(cmbTipPropDorit, "Selectati tipul proprietatii dorite!");
                cmbTipPropDorit.Focus();
                return;
            }

            if (string.IsNullOrWhiteSpace(txtLocatieDorita.Text))
            {
                errorProviderProprietati.SetError(txtLocatieDorita, "Introduceti locatia dorita!");
                txtLocatieDorita.Focus();
                return;
            }

            if (numPretMinCerere.Value > numPretMax.Value && numPretMax.Value > 0)
            {
                errorProviderProprietati.SetError(numPretMaxCerere, "Pretul maxim trebuie sa fie mai mare sau egal cu pretul minim!");
                numPretMaxCerere.Focus();
                return;
            }

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "INSERT INTO Cereri (ClientIdRef, TipProprietateDorit, LocatieDorita, PretMin, PretMax, SuprafataMin, NrDormitoareMin, DataCererii, StatusCerere) " +
                                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("ClientIdRef", OleDbType.Integer).Value = ((Client)cmbClientPentruCerere.SelectedItem).ClientId;
                    cmd.Parameters.Add("TipProprietateDorit", OleDbType.VarChar).Value = cmbTipPropDorit.Text;
                    cmd.Parameters.Add("LocatieDorita", OleDbType.VarChar).Value = txtLocatieDorita.Text;
                    cmd.Parameters.Add("PretMin", OleDbType.Currency).Value = numPretMinCerere.Value;
                    cmd.Parameters.Add("PretMax", OleDbType.Currency).Value = numPretMax.Value;
                    cmd.Parameters.Add("SuprafataMin", OleDbType.Double).Value = (double)numSuprafataMin.Value;
                    cmd.Parameters.Add("NrDormitoareMin", OleDbType.Integer).Value = (int)numNrMinDorm.Value;
                    cmd.Parameters.Add("DataCererii", OleDbType.Date).Value = DateTime.Now;
                    cmd.Parameters.Add("StatusCerere", OleDbType.VarChar).Value = RequestStatus.Active.ToString();

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Cerere adaugata cu succes!", "Succes");
                        IncarcaCereriDinDB();
                        AfiseazaCereri();

                        cmbClientPentruCerere.SelectedIndex = -1;
                        cmbTipPropDorit.SelectedIndex = -1;
                        txtLocatieDorita.Clear();
                        numPretMinCerere.Value = 0;
                        numPretMax.Value = 0;
                        numSuprafataMin.Value = 0;
                        numNrMinDorm.Value = 0;
                        cmbClientPentruCerere.Focus();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la adaugarea cererii: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void btnStergeCerere_Click(object sender, EventArgs e)
        {
            if (lvCereri.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam selectati o cerere din lista pentru a o sterge.", "Nicio selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            ClientRequest cerereDeSters = (ClientRequest)lvCereri.SelectedItems[0].Tag;

            if (MessageBox.Show("Sunteti sigur ca doriti sa stergeti cererea selectata?", "Confirmare Stergere", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes)
            {
                using (OleDbConnection conexiune = new OleDbConnection(connString))
                {
                    try
                    {
                        conexiune.Open();
                        string query = "DELETE FROM Cereri WHERE RequestId = ?";
                        OleDbCommand cmd = new OleDbCommand(query, conexiune);
                        cmd.Parameters.Add("RequestId", OleDbType.Integer).Value = cerereDeSters.RequestId;

                        if (cmd.ExecuteNonQuery() > 0)
                        {
                            MessageBox.Show("Cererea a fost stearsa!", "Succes");
                            IncarcaCereriDinDB();
                            AfiseazaCereri();
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"A aparut o eroare la stergerea cererii: {ex.Message}", "Eroare Baza de Date", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }

            //Client clientAsociat = listaClienti.FirstOrDefault(c => c.ClientId == cerereDeSters.ClientId);
            //string numeClient = clientAsociat != null ? $"{clientAsociat.FirstName} {clientAsociat.LastName}" : "N/A";

            //DialogResult rezultat = MessageBox.Show(
            //    $"Sunteti sigur ca doriti sa stergeti cererea clientului '{numeClient}' pentru o proprietate de tip '{cerereDeSters.DesiredPropertyType}'?",
            //    "Confirmare Stergere Cerere",
            //    MessageBoxButtons.YesNo,
            //    MessageBoxIcon.Warning);

            //if (rezultat == DialogResult.Yes)
            //{
            //    listaCereri.Remove(cerereDeSters);
            //    AfiseazaCereri();

            //    cmbClientPentruCerere.SelectedIndex = -1;
            //    cmbTipPropDorit.SelectedIndex = -1;
            //    txtLocatieDorita.Clear();
            //    numPretMinCerere.Value = 0;
            //    numPretMax.Value = 0;
            //    numSuprafataMin.Value = 0;
            //    numNrMinDorm.Value = 0;
            //    cmbClientPentruCerere.Focus();
            //}
        }

        private void btnCautaProprietatiPotrivite_Click(object sender, EventArgs e)
        {
            if (lvCereri.SelectedItems.Count == 0)
            {
                MessageBox.Show("Va rugam selectati o cerere din lista pentru a cauta proprietati.", "Nicio cerere selectata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            ClientRequest cerereSelectata = (ClientRequest)lvCereri.SelectedItems[0].Tag;
            lvCautaDupaCerere.Items.Clear();
            List<Property> proprietatiGasite = new List<Property>();

            foreach (Property prop in listaProprietati)
            {
                if (prop.Status != PropertyStatus.ForSale && prop.Status != PropertyStatus.ForRent)
                    continue;

                //Tipul proprietatii trebuie sa fie identic
                if (prop.Type != cerereSelectata.DesiredPropertyType)
                    continue;

                //Pretul trebuie sa fie in interval
                bool pretPotrivit = false;
                if (cerereSelectata.MaxPrice > 0)
                {
                    if (prop.Price >= cerereSelectata.MinPrice && prop.Price <= cerereSelectata.MaxPrice)
                    {
                        pretPotrivit = true;
                    }
                }
                else
                {
                    if (prop.Price >= cerereSelectata.MinPrice)
                    {
                        pretPotrivit = true;
                    }
                }

                if (!pretPotrivit)
                    continue;

                int potriviriSecundare = 0;

                //Adresa
                if (!string.IsNullOrWhiteSpace(cerereSelectata.DesiredLocation))
                {
                    if (prop.Address.IndexOf(cerereSelectata.DesiredLocation, StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        potriviriSecundare++;
                    }
                }

                //Suprafata (o sa ale afiseze si pe cele cu 5 mp mai mici)
                if (cerereSelectata.MinArea > 0)
                {
                    if (prop.Area >= (cerereSelectata.MinArea - 5))
                    {
                        potriviriSecundare++;
                    }
                }

                if (cerereSelectata.MinBedrooms > 0)
                {
                    if (prop.NumberOfBedrooms == cerereSelectata.MinBedrooms)
                    {
                        potriviriSecundare++;
                    }
                }

                if (potriviriSecundare >= 2)
                {
                    proprietatiGasite.Add(prop);
                }
            }

            if (proprietatiGasite.Count > 0)
            {
                foreach (Property propPotrivita in proprietatiGasite)
                {
                    Agent agentAsociat = listaAgenti.FirstOrDefault(a => a.AgentId == propPotrivita.AgentId);
                    string numeAgent = agentAsociat != null ? $"{agentAsociat.FirstName} {agentAsociat.LastName}" : "N/A";

                    ListViewItem item = new ListViewItem(propPotrivita.Address);
                    item.SubItems.Add(propPotrivita.Type.ToString());
                    item.SubItems.Add(propPotrivita.Price.ToString("C"));
                    item.SubItems.Add(propPotrivita.Area.ToString());
                    item.SubItems.Add(propPotrivita.Status.ToString());
                    item.SubItems.Add(numeAgent);
                    item.Tag = propPotrivita;
                    lvCautaDupaCerere.Items.Add(item);
                }
            }
            else
            {
                MessageBox.Show("Nu au fost gasite proprietati care sa corespunda criteriilor specificate.", "Cautare Fara Rezultate Detaliate", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void lvCautaDupaCerere_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            if (lvCautaDupaCerere.SelectedItems.Count > 0 && lvCereri.SelectedItems.Count > 0)
            {
                Property propSelectataDinCautare = (Property)lvCautaDupaCerere.SelectedItems[0].Tag;

                ClientRequest cerereCurenta = (ClientRequest)lvCereri.SelectedItems[0].Tag;

                Client clientPentruOferta = listaClienti.FirstOrDefault(c => c.ClientId == cerereCurenta.ClientId);

                if (propSelectataDinCautare != null && clientPentruOferta != null)
                {
                    if (propSelectataDinCautare.Status != PropertyStatus.ForSale &&
                        propSelectataDinCautare.Status != PropertyStatus.ForRent)
                    {
                        MessageBox.Show($"Proprietatea '{propSelectataDinCautare.Address}' nu mai este disponibila pentru oferte (status: {propSelectataDinCautare.Status}).",
                                        "Indisponibil",
                                        MessageBoxButtons.OK,
                                        MessageBoxIcon.Warning);
                        return;
                    }

                    proprietateSelectataPentruOferta = propSelectataDinCautare;

                    lblProprietatePentruOferta.Text = $"Oferta pentru: {propSelectataDinCautare.Address}";

                    cmbClientOfertant.SelectedItem = clientPentruOferta;

                    numSumaOferita.Value = 0;

                    errorProviderProprietati.Clear();

                    tabControl1.SelectedTab = tabAdaugaOferta;

                    numSumaOferita.Focus();
                }
            }
        }

        private void btnInapoiVizualizareOferte_Click(object sender, EventArgs e)
        {
            lblOfertePentruProprietatea.Text = "Oferte pentru: -";
            lvOferteSpecifice.Items.Clear();

            if (this.modDeschidereFormular == "ModCereriOferte")
            {
                if (tabControl1.TabPages.Contains(tabCereri))
                {
                    tabControl1.SelectedTab = tabCereri;
                }
                else if (tabControl1.TabPages.Count > 0)
                {
                    tabControl1.SelectedIndex = 0;
                }
            }
            else
            {
                if (tabControl1.TabPages.Contains(tabProprietati))
                {
                    tabControl1.SelectedTab = tabProprietati;
                }
                else if (tabControl1.TabPages.Count > 0)
                {
                    tabControl1.SelectedIndex = 0;
                }
            }
        }

        private void panelGraficTipuri_Paint(object sender, PaintEventArgs e)
        {
            if (distributieTipuriProprietati != null && distributieTipuriProprietati.Any(kvp => kvp.Value > 0))
            {
                DeseneazaGraficTipuriProprietati(e.Graphics, panelGraficTipuri.ClientRectangle);
            }
            else
            {
                string mesajGol = "Apasati 'Genereaza grafic' sau nu exista date.";
                SizeF marimeMesaj = e.Graphics.MeasureString(mesajGol, fontTextGrafic);
                e.Graphics.DrawString(mesajGol, fontTextGrafic, Brushes.Gray,
                                     panelGraficTipuri.Width / 2 - marimeMesaj.Width / 2,
                                     panelGraficTipuri.Height / 2 - marimeMesaj.Height / 2);
            }
        }

        private void btnGenereazaGraficTipuri_Click(object sender, EventArgs e)
        {
            PregatesteDateGraficTipuri();
            panelGraficTipuri.Invalidate();

            this.btnGenereazaGraficTipuri.Visible = false;

            this.btnPrint.Visible = true;
        }

        private void tabControl1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (tabControl1.SelectedTab == tabStatistici)
            {
                this.btnGenereazaGraficTipuri.Visible = true;

                this.btnPrint.Visible = false;

                PregatesteDateGraficTipuri();
                panelGraficTipuri.Invalidate();
            }
        }

        private void btnPrint_Click(object sender, EventArgs e)
        {
            PregatesteDateGraficTipuri();
            panelGraficTipuri.Invalidate();

            PrintPreviewDialog printPreviewDlg = new PrintPreviewDialog();

            printPreviewDlg.Document = printDocument1;

            printPreviewDlg.ShowDialog();
        }

        private void printDocument1_PrintPage(object sender, System.Drawing.Printing.PrintPageEventArgs e)
        {
            if (distributieTipuriProprietati == null || !distributieTipuriProprietati.Any(kvp => kvp.Value > 0))
            {
                PregatesteDateGraficTipuri();
            }

            Rectangle zonaPrintare = e.MarginBounds;

            DeseneazaGraficTipuriProprietati(e.Graphics, zonaPrintare);

            e.HasMorePages = false;
        }

        private void txtContinutFisierJSON_DragEnter(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                e.Effect = DragDropEffects.Copy;
            }
            else
            {
                e.Effect = DragDropEffects.None;
            }
        }

        private void txtContinutFisierJSON_DragDrop(object sender, DragEventArgs e)
        {
            string[] fisiere = (string[])e.Data.GetData(DataFormats.FileDrop);

            if (fisiere != null && fisiere.Length > 0)
            {
                string caleFisier = fisiere[0];

                if (Path.GetExtension(caleFisier).Equals(".json", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        string continut = File.ReadAllText(caleFisier);
                        txtContinutFisierJSON.Text = continut;
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"A aparut o eroare la citirea fisierului: {ex.Message}", "Eroare Fisier", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        txtContinutFisierJSON.Text = "Eroare la incarcarea fisierului.";
                    }
                }
                else
                {
                    MessageBox.Show("Va rugam trageti doar fisiere de tip .json.", "Tip Fisier Invalid", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    txtContinutFisierJSON.Text = "Doar fisierele .json sunt acceptate.";
                }
            }
        }

        private void btnDeschideFisiere_Click(object sender, EventArgs e)
        {
            string folderAplicatie = Application.StartupPath;

            try
            {
                System.Diagnostics.Process.Start("explorer.exe", folderAplicatie);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Nu s-a putut deschide File Explorer in locatia specificata: {ex.Message}",
                                "Eroare la deschidere Explorer",
                                MessageBoxButtons.OK,
                                MessageBoxIcon.Error);
            }
        }

        private void btnModificaClient_Click(object sender, EventArgs e)
        {
            if (lvClienti.SelectedItems.Count == 0)
            {
                MessageBox.Show("Selectati un client pentru a-l modifica.", "Nicio selectie");
                return;
            }

            //Validare nume
            if (string.IsNullOrWhiteSpace(txtNumeClient.Text))
            {
                errorProviderProprietati.SetError(txtNumeClient, "Numele clientului este obligatoriu!");
                txtNumeClient.Focus();
                return;
            }

            //Validare prenume
            if (string.IsNullOrWhiteSpace(txtPrenumeClient.Text))
            {
                errorProviderProprietati.SetError(txtPrenumeClient, "Prenumele clientului este obligatoriu!");
                txtPrenumeClient.Focus();
                return;
            }

            //Validare email
            if (string.IsNullOrWhiteSpace(txtEmailClient.Text) || !txtEmailClient.Text.Contains("@"))
            {
                errorProviderProprietati.SetError(txtEmailClient, "Adresa de email este invalida!");
                txtEmailClient.Focus();
                return;
            }

            //Validare telefon 
            if (string.IsNullOrWhiteSpace(txtTelefonClient.Text) || !txtTelefonClient.Text.All(char.IsDigit) ||
                txtTelefonClient.Text.Length != 10)
            {
                errorProviderProprietati.SetError(txtTelefonClient, "Numarul de telefon trebuie sa contina exact 10 cifre!");
                txtTelefonClient.Focus();
                return;
            }

            //Validare tip client
            if (cmbTipClient.SelectedIndex == -1)
            {
                errorProviderProprietati.SetError(cmbTipClient, "Va rugam selectati tipul clientului!");
                cmbTipClient.Focus();
                return;
            }

            Client clientDeModificat = (Client)lvClienti.SelectedItems[0].Tag;

            using (OleDbConnection conexiune = new OleDbConnection(connString))
            {
                try
                {
                    conexiune.Open();
                    string query = "UPDATE Clienti SET Nume = ?, Prenume = ?, Telefon = ?, Email = ?, TipClient = ? WHERE ClientID = ?";
                    OleDbCommand cmd = new OleDbCommand(query, conexiune);

                    cmd.Parameters.Add("Nume", OleDbType.VarChar).Value = txtNumeClient.Text;
                    cmd.Parameters.Add("Prenume", OleDbType.VarChar).Value = txtPrenumeClient.Text;
                    cmd.Parameters.Add("Telefon", OleDbType.VarChar).Value = txtTelefonClient.Text;
                    cmd.Parameters.Add("Email", OleDbType.VarChar).Value = txtEmailClient.Text;
                    cmd.Parameters.Add("TipClient", OleDbType.VarChar).Value = cmbTipClient.Text;
                    cmd.Parameters.Add("ClientID", OleDbType.Integer).Value = clientDeModificat.ClientId;

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        MessageBox.Show("Client modificat cu succes!", "Succes");
                        IncarcaClientiDinDB();
                        AfiseazaClienti();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Eroare la modificarea clientului: {ex.Message}", "Eroare DB");
                }
            }
        }

        private void btnStergeClient_Click(object sender, EventArgs e)
        {
            if (lvClienti.SelectedItems.Count == 0)
            {
                MessageBox.Show("Selectati un client pentru a-l sterge.", "Nicio selectie");
                return;
            }

            Client clientDeSters = (Client)lvClienti.SelectedItems[0].Tag;

            if (MessageBox.Show($"Sunteti sigur ca doriti sa stergeti clientul '{clientDeSters.FirstName} {clientDeSters.LastName}'?", "Confirmare Ștergere", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes)
            {
                using (OleDbConnection conexiune = new OleDbConnection(connString))
                {
                    try
                    {
                        conexiune.Open();
                        string query = "DELETE FROM Clienti WHERE ClientId = ?";
                        OleDbCommand cmd = new OleDbCommand(query, conexiune);
                        cmd.Parameters.Add("ClientID", OleDbType.Integer).Value = clientDeSters.ClientId;

                        if (cmd.ExecuteNonQuery() > 0)
                        {
                            MessageBox.Show("Clientul a fost șters cu succes!", "Succes");
                            IncarcaClientiDinDB();
                            AfiseazaClienti();

                            txtNumeClient.Clear();
                            txtPrenumeClient.Clear();
                            txtEmailClient.Clear();
                            txtTelefonClient.Clear();
                            cmbTipClient.SelectedIndex = -1;
                        }
                    }
                    catch (Exception ex)
                    {
                        // O eroare aici poate apărea dacă încerci să ștergi un client care este
                        // referit în alt tabel (ex: într-o proprietate) și ai setat 'Enforce Referential Integrity'
                        MessageBox.Show($"Eroare la ștergerea clientului: {ex.Message}", "Eroare DB");
                    }
                }
            }
        }

        private void lvClienti_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvClienti.SelectedItems.Count > 0)
            {
                Client clientSelectat = (Client)lvClienti.SelectedItems[0].Tag;

                txtNumeClient.Text = clientSelectat.FirstName;
                txtPrenumeClient.Text = clientSelectat.LastName;
                txtEmailClient.Text = clientSelectat.Email;
                txtTelefonClient.Text = clientSelectat.PhoneNumber;
                cmbTipClient.SelectedItem = clientSelectat.Type;
            }
        }
    }
}

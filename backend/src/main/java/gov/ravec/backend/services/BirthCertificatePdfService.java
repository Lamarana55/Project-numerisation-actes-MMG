package gov.ravec.backend.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import gov.ravec.backend.entities.ValidBirth;
import gov.ravec.backend.repositories.ValidBirthRepository;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Génère la COPIE INTÉGRALE d'un acte de naissance validé (PDF).
 * Layout fidèle au modèle officiel guinéen avec QR code et armoiries.
 */
@Service
public class BirthCertificatePdfService {

    private final ValidBirthRepository validBirthRepository;

    // ── Polices ─────────────────────────────────────────────────
    private static final Font FONT_TITLE = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
    private static final Font FONT_SUBTITLE = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD);
    private static final Font FONT_HEADER = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_LABEL = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD | Font.ITALIC);
    private static final Font FONT_VALUE = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_SECTION = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD | Font.UNDERLINE);
    private static final Font FONT_SMALL = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL);
    private static final Font FONT_SMALL_BOLD = new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD);
    private static final Font FONT_ITALIC = new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC);
    private static final Font FONT_MENTION = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD | Font.ITALIC);

    private static final BaseColor LIGHT_GRAY = new BaseColor(245, 245, 245);

    public BirthCertificatePdfService(ValidBirthRepository validBirthRepository) {
        this.validBirthRepository = validBirthRepository;
    }

    /**
     * Génère le PDF de copie intégrale pour un acte validé.
     *
     * @param id identifiant de l'acte
     * @return bytes du PDF
     */
    public byte[] generate(String id) throws Exception {
        ValidBirth acte = validBirthRepository.findByIdAndIsDeleted(id, Delete.No)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));

        if (acte.getStatut() != ValidationStatut.VALIDE) {
            throw new IllegalStateException(
                    "Seul un acte VALIDÉ peut être imprimé. Statut actuel : " + acte.getStatut());
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 40, 40);
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        document.open();

        // ── Filigrane armoiries en fond ──────────────────────────
        addWatermark(writer);

        // ── EN-TÊTE ─────────────────────────────────────────────
        addHeader(document, acte);

        document.add(Chunk.NEWLINE);

        // ── SECTION ENFANT ──────────────────────────────────────
        addSectionTitle(document, "ENFANT");
        addField(document, "NPI", safe(acte.getRavecId()));
        addField(document, "Prénoms", safe(acte.getPrenoms()));
        addField(document, "Nom", safe(acte.getNom()));
        addField(document, "Sexe", formatGenre(acte.getGenre()));
        addField(document, "Date et heure de naissance",
                formatDateNaissanceComplete(acte));
        addField(document, "Lieu de naissance", buildLieuNaissance(acte));
        addField(document, "Rang de naissance chez la mère", safe(acte.getRangNaissance()));

        document.add(Chunk.NEWLINE);

        // ── SECTION PARENTS ─────────────────────────────────────
        addSectionTitle(document, "PARENTS");
        addParentsTable(document, acte);

        document.add(Chunk.NEWLINE);

        // ── SECTION DÉCLARANT ───────────────────────────────────
        addSectionTitle(document, "DÉCLARANT");
        addField(document, "Date de déclaration",
                formatDateDeclaration(acte));
        addField(document, "Lien de parenté", safe(acte.getLien_de_prarente_avec_le_declarant()));

        document.add(Chunk.NEWLINE);

        // ── MENTIONS MARGINALES ─────────────────────────────────
        Paragraph mentions = new Paragraph("Mentions Marginales : Néant.", FONT_MENTION);
        mentions.setAlignment(Element.ALIGN_CENTER);
        document.add(mentions);

        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // ── PIED DE PAGE : QR Code + date + signature ───────────
        addFooter(document, acte, writer);

        document.close();
        return baos.toByteArray();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  COMPOSANTS DU PDF
    // ═══════════════════════════════════════════════════════════════════

    private void addWatermark(PdfWriter writer) {
        try {
            InputStream is = new ClassPathResource("static/images/armoiries_guinee.png").getInputStream();
            Image armoiries = Image.getInstance(is.readAllBytes());
            armoiries.setAbsolutePosition(
                    (PageSize.A4.getWidth() - 300) / 2,
                    (PageSize.A4.getHeight() - 300) / 2
            );
            armoiries.scaleToFit(300, 300);
            armoiries.setTransparency(new int[]{200, 200});

            PdfContentByte canvas = writer.getDirectContentUnder();
            PdfGState gs = new PdfGState();
            gs.setFillOpacity(0.08f);
            gs.setStrokeOpacity(0.08f);
            canvas.saveState();
            canvas.setGState(gs);
            canvas.addImage(armoiries);
            canvas.restoreState();
        } catch (Exception ignored) {
            // Si l'image n'est pas disponible, on continue sans filigrane
        }
    }

    private void addHeader(Document document, ValidBirth acte) throws DocumentException {
        // Ligne 1 : RÉPUBLIQUE DE GUINÉE + COPIE INTÉGRALE
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{50, 50});

        // Colonne gauche
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.addElement(new Paragraph("RÉPUBLIQUE DE GUINÉE", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        leftCell.addElement(new Paragraph("Travail – Justice – Solidarité", new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC)));
        leftCell.addElement(Chunk.NEWLINE);
        leftCell.addElement(new Paragraph("Région de " + safe(acte.getRegion()), FONT_HEADER));
        leftCell.addElement(new Paragraph("Commune de " + safe(acte.getCommune()) + " " + safe(acte.getPrefecture()), FONT_HEADER));
        leftCell.addElement(new Paragraph("Centre d'état civil de " + safe(acte.getCommune()), FONT_HEADER));

        // Colonne droite
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph titleP = new Paragraph("COPIE INTÉGRALE", FONT_TITLE);
        titleP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(titleP);

        Paragraph subtitleP = new Paragraph("Acte de naissance", FONT_SUBTITLE);
        subtitleP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(subtitleP);

        rightCell.addElement(Chunk.NEWLINE);

        Paragraph registreP = new Paragraph(
                "Registre de l'année " + safe(acte.getAnneeRegistre()) + "\nN° " + safe(acte.getNumeroActe()),
                FONT_HEADER);
        registreP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(registreP);

        headerTable.addCell(leftCell);
        headerTable.addCell(rightCell);
        document.add(headerTable);
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        Paragraph p = new Paragraph(title, FONT_SECTION);
        p.setSpacingBefore(8);
        p.setSpacingAfter(6);
        document.add(p);
    }

    private void addField(Document document, String label, String value) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{35, 65});

        PdfPCell labelCell = new PdfPCell(new Phrase(label, FONT_LABEL));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(3);

        PdfPCell valueCell = new PdfPCell(new Phrase(": " + value, FONT_VALUE));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(3);

        table.addCell(labelCell);
        table.addCell(valueCell);
        document.add(table);
    }

    private void addParentsTable(Document document, ValidBirth acte) throws DocumentException {
        // Tableau à 3 colonnes : label | père | mère
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30, 35, 35});
        table.setSpacingBefore(4);

        // En-tête
        addParentHeaderRow(table);

        // Lignes de données
        addParentRow(table, "NPI", safe(acte.getRavecId()), "");
        addParentRow(table, "Prénoms et Nom",
                safe(acte.getPrenomPere()) + " " + safe(acte.getNomPere()),
                safe(acte.getPrenomMere()) + " " + safe(acte.getNomMere()));
        addParentRow(table, "Date de naissance",
                safe(acte.getDateNaissancePere()),
                safe(acte.getDateNaissanceMere()));
        addParentRow(table, "Lieu de naissance", "", "");
        addParentRow(table, "Nationalité",
                safe(acte.getNationalitePere()),
                safe(acte.getNationaliteMere()));
        addParentRow(table, "Profession",
                safe(acte.getProfessionPere()),
                safe(acte.getProfessionMere()));
        addParentRow(table, "Domicile",
                safe(acte.getDomicileParent()),
                safe(acte.getDomicileParent()));

        document.add(table);
    }

    private void addParentHeaderRow(PdfPTable table) {
        PdfPCell emptyCell = new PdfPCell(new Phrase("", FONT_SMALL));
        emptyCell.setBorder(Rectangle.NO_BORDER);
        emptyCell.setPaddingBottom(4);
        table.addCell(emptyCell);

        PdfPCell pereCell = new PdfPCell(new Phrase("PÈRE", FONT_SMALL_BOLD));
        pereCell.setBorder(Rectangle.NO_BORDER);
        pereCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        pereCell.setPaddingBottom(4);
        pereCell.setBackgroundColor(LIGHT_GRAY);
        table.addCell(pereCell);

        PdfPCell mereCell = new PdfPCell(new Phrase("MÈRE", FONT_SMALL_BOLD));
        mereCell.setBorder(Rectangle.NO_BORDER);
        mereCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        mereCell.setPaddingBottom(4);
        mereCell.setBackgroundColor(LIGHT_GRAY);
        table.addCell(mereCell);
    }

    private void addParentRow(PdfPTable table, String label, String pere, String mere) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FONT_LABEL));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(3);

        PdfPCell pereCell = new PdfPCell(new Phrase(": " + pere, FONT_VALUE));
        pereCell.setBorder(Rectangle.NO_BORDER);
        pereCell.setPaddingBottom(3);

        PdfPCell mereCell = new PdfPCell(new Phrase(mere, FONT_VALUE));
        mereCell.setBorder(Rectangle.NO_BORDER);
        mereCell.setPaddingBottom(3);

        table.addCell(labelCell);
        table.addCell(pereCell);
        table.addCell(mereCell);
    }

    private void addFooter(Document document, ValidBirth acte, PdfWriter writer) throws Exception {
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{30, 70});

        // ── QR Code (colonne gauche) ────────────────────────────
        String qrData = buildQrData(acte);
        Image qrImage = generateQrCodeImage(qrData, 100, 100);
        PdfPCell qrCell = new PdfPCell(qrImage, true);
        qrCell.setBorder(Rectangle.NO_BORDER);
        qrCell.setFixedHeight(110);
        qrCell.setPadding(5);
        qrCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        footerTable.addCell(qrCell);

        // ── Signature (colonne droite) ──────────────────────────
        PdfPCell sigCell = new PdfPCell();
        sigCell.setBorder(Rectangle.NO_BORDER);
        sigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        String dateFormatted = safe(acte.getCommune()) + ", le " +
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy",
                        java.util.Locale.FRENCH));

        Paragraph dateP = new Paragraph(dateFormatted, FONT_VALUE);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        sigCell.addElement(dateP);

        sigCell.addElement(Chunk.NEWLINE);

        Paragraph copyP = new Paragraph("Pour copie certifiée conforme à l'original", FONT_VALUE);
        copyP.setAlignment(Element.ALIGN_RIGHT);
        sigCell.addElement(copyP);

        Paragraph officerP = new Paragraph("L'officier délégué de l'État Civil", FONT_VALUE);
        officerP.setAlignment(Element.ALIGN_RIGHT);
        sigCell.addElement(officerP);

        footerTable.addCell(sigCell);
        document.add(footerTable);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  UTILITAIRES
    // ═══════════════════════════════════════════════════════════════════

    private String safe(String value) {
        return value != null ? value.trim() : "";
    }

    private String formatGenre(String genre) {
        if (genre == null) return "";
        return switch (genre.toUpperCase()) {
            case "M" -> "Masculin";
            case "F" -> "Féminin";
            default -> genre;
        };
    }

    private String formatDateNaissanceComplete(ValidBirth acte) {
        StringBuilder sb = new StringBuilder();

        // Date en toutes lettres
        String dateLettre = convertDateToWords(
                acte.getJours_des_faits(),
                acte.getMois_des_faits(),
                acte.getAnnee_des_faits());
        sb.append(dateLettre);

        // Heure
        String heure = safe(acte.getHeureNaissance());
        String minute = safe(acte.getMinuteNaissance());
        if (!heure.isEmpty()) {
            sb.append(" à ").append(heure).append("h");
            if (!minute.isEmpty() && !"0".equals(minute)) {
                sb.append(minute);
            } else {
                sb.append("ZÉRO");
            }
        }

        // Date numérique entre parenthèses
        String dateNum = formatDateNumerique(
                acte.getJours_des_faits(),
                acte.getMois_des_faits(),
                acte.getAnnee_des_faits());
        if (!dateNum.isEmpty()) {
            sb.append(" (").append(dateNum).append(")");
        }

        return sb.toString();
    }

    private String convertDateToWords(String jour, String mois, String annee) {
        StringBuilder sb = new StringBuilder();
        if (jour != null && !jour.isEmpty()) {
            sb.append(numberToFrenchWord(Integer.parseInt(jour)));
        }
        if (mois != null && !mois.isEmpty()) {
            sb.append(" ").append(monthToFrench(Integer.parseInt(mois)));
        }
        if (annee != null && !annee.isEmpty()) {
            sb.append(" ").append(yearToFrenchWords(Integer.parseInt(annee)));
        }
        return sb.toString().trim();
    }

    private String formatDateNumerique(String jour, String mois, String annee) {
        if (jour == null || mois == null || annee == null) return "";
        try {
            return String.format("%02d/%02d/%s",
                    Integer.parseInt(jour),
                    Integer.parseInt(mois),
                    annee);
        } catch (NumberFormatException e) {
            return jour + "/" + mois + "/" + annee;
        }
    }

    private String formatDateDeclaration(ValidBirth acte) {
        String dateEtab = safe(acte.getDate_etablissement_acte());
        if (dateEtab.isEmpty()) return "";

        // Essayer de parser la date au format dd/MM/yyyy ou yyyy-MM-dd
        try {
            LocalDate date;
            if (dateEtab.contains("/")) {
                date = LocalDate.parse(dateEtab, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } else if (dateEtab.contains("-")) {
                date = LocalDate.parse(dateEtab, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            } else {
                return dateEtab;
            }

            String lettres = convertDateToWords(
                    String.valueOf(date.getDayOfMonth()),
                    String.valueOf(date.getMonthValue()),
                    String.valueOf(date.getYear()));
            String numerique = date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            return lettres + " (" + numerique + ")";
        } catch (Exception e) {
            return dateEtab;
        }
    }

    private String buildLieuNaissance(ValidBirth acte) {
        StringBuilder sb = new StringBuilder();
        if (acte.getCommune_de_nais() != null && !acte.getCommune_de_nais().isEmpty()) {
            sb.append(acte.getCommune_de_nais());
        } else if (acte.getCommune() != null) {
            sb.append(acte.getCommune());
        }
        if (acte.getPrefecture_de_nais() != null && !acte.getPrefecture_de_nais().isEmpty()) {
            sb.append(" (").append(acte.getPrefecture_de_nais()).append(")");
        } else if (acte.getPrefecture() != null && !acte.getPrefecture().isEmpty()) {
            sb.append(" (").append(acte.getPrefecture()).append(")");
        }
        if (acte.getPlace_de_naissance() != null && !acte.getPlace_de_naissance().isEmpty()) {
            sb.append(", ").append(acte.getPlace_de_naissance());
        }
        return sb.toString();
    }

    private String buildQrData(ValidBirth acte) {
        return "ACTE_NAISSANCE|" +
                "ID:" + safe(acte.getId()) + "|" +
                "NPI:" + safe(acte.getRavecId()) + "|" +
                "NOM:" + safe(acte.getPrenoms()) + " " + safe(acte.getNom()) + "|" +
                "DN:" + safe(acte.getDateNaissance()) + "|" +
                "ACTE:" + safe(acte.getNumeroActe()) + "|" +
                "REG:" + safe(acte.getAnneeRegistre());
    }

    private Image generateQrCodeImage(String data, int width, int height) throws Exception {
        QRCodeWriter qrWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = Map.of(
                EncodeHintType.MARGIN, 1,
                EncodeHintType.CHARACTER_SET, "UTF-8"
        );
        BitMatrix matrix = qrWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);

        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                bufferedImage.setRGB(x, y, matrix.get(x, y) ? 0x000000 : 0xFFFFFF);
            }
        }

        ByteArrayOutputStream imgBaos = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", imgBaos);
        return Image.getInstance(imgBaos.toByteArray());
    }

    // ── Conversion nombre → mots français ───────────────────────

    private String numberToFrenchWord(int n) {
        if (n == 0) return "zéro";
        if (n == 1) return "premier";

        String[] units = {"", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
                "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
                "dix-sept", "dix-huit", "dix-neuf"};
        String[] tens = {"", "", "vingt", "trente", "quarante", "cinquante",
                "soixante", "soixante", "quatre-vingt", "quatre-vingt"};

        if (n < 20) return units[n];
        if (n < 100) {
            int t = n / 10;
            int u = n % 10;
            if (t == 7 || t == 9) {
                return tens[t] + "-" + units[10 + u];
            }
            if (u == 0) return tens[t];
            if (u == 1 && t != 8) return tens[t] + " et un";
            return tens[t] + "-" + units[u];
        }
        return String.valueOf(n);
    }

    private String monthToFrench(int month) {
        String[] months = {"", "janvier", "février", "mars", "avril", "mai", "juin",
                "juillet", "août", "septembre", "octobre", "novembre", "décembre"};
        if (month >= 1 && month <= 12) return months[month];
        return String.valueOf(month);
    }

    private String yearToFrenchWords(int year) {
        if (year < 1000 || year > 9999) return String.valueOf(year);

        String[] units = {"", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"};

        int thousands = year / 1000;
        int remainder = year % 1000;
        int hundreds = remainder / 100;
        int lastTwo = remainder % 100;

        StringBuilder sb = new StringBuilder();

        // Milliers
        if (thousands == 1) {
            sb.append("mille ");
        } else if (thousands > 1) {
            sb.append(units[thousands]).append(" mille ");
        }

        // Centaines
        if (hundreds == 1) {
            sb.append("neuf cent ");
        } else if (hundreds > 1) {
            sb.append(units[hundreds]).append(" cent ");
        }

        // Vérification spéciale pour les années 1900, 2000, etc.
        if (year >= 1900 && year < 2000) {
            int h = (year - 1000) / 100;
            int lt = year % 100;
            sb = new StringBuilder("mille ");
            sb.append(units[h]).append(" cent ");
            if (lt > 0) {
                sb.append(numberToFrenchWord(lt));
            }
        } else if (year >= 2000 && year < 3000) {
            sb = new StringBuilder("deux mille ");
            int lt = year % 1000;
            if (lt > 0) {
                if (lt < 100) {
                    sb.append(numberToFrenchWord(lt));
                } else {
                    int h2 = lt / 100;
                    int u2 = lt % 100;
                    if (h2 == 1) sb.append("cent ");
                    else sb.append(units[h2]).append(" cent ");
                    if (u2 > 0) sb.append(numberToFrenchWord(u2));
                }
            }
        }

        return sb.toString().trim();
    }
}

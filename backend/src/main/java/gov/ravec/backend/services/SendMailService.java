package gov.ravec.backend.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class SendMailService {
    private static final Logger logger = LoggerFactory.getLogger(SendMailService.class);
    @Autowired
    private JavaMailSender javaMailSender;

    public void sendEmailHtmlReset(String nom, String email, String lien) throws MessagingException {
        logger.info("Sending mail for : " + email +" :reset password.................!");
        MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMailMessage,true);
        mimeMessageHelper.setFrom("ande.developper@gmail.com");
        mimeMessageHelper.setTo(new String[]{"lamarana55@gmail.com", email});
        mimeMessageHelper.setCc(new String[]{"ande.developper@gmail.com", "anien.dev@gmail.com"});
        mimeMessageHelper.setSubject("Lien pour réinitialiser votre mot de passe");
        mimeMessageHelper.setText(bodyResetPassword(nom, lien), true);
        javaMailSender.send(mimeMailMessage);
        logger.info("Mail generate password envoyé...................");
    }

    public String bodyResetPassword(String nom, String lien) {
        return String.format("""
        <h1>Bonjour Mr/Mme %s,</h1>
        <p><h3>Vous avez demandé la réinitialisation de votre mot de passe.</h3></p>
        <p><h3>Cliquez sur le lien ci-dessous pour modifier votre mot de passe</h3></p>
        <p><h3><strong><a href=%s>changer le mot de pass</a></strong></h3></p>
        <p><h3>NB: le lien expire dans 30 minutes </h3></p>
        <p><h3>Si vous ne souhaitez pas réinitialiser votre mot de passe, ignorez cet e-mail et aucune action ne sera entreprise</h3></p>
        
        <p><h2>L'équipe <a target="_blank" rel="noopener noreferrer" href="https://ande.gov.gn/" >ANDE</a> </h2></p>
        
    """, nom, lien);
    }

}

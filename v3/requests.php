<?php
require_once "helper.php";
require_once 'firms/firms.php';
require_once 'firms/contacts.php';
require_once 'firms/workshops.php';
require_once 'firms/stats.php';
require_once 'firms/meets.php';
require_once 'firms/gifts.php';
require_once 'firms/events.php';
require_once 'firms/campaign.php';
require_once 'firms/practice.php';
require_once 'firms/cvinvitations.php';
require_once 'firms/ContactVcfExporter.php';
require_once "ResponseHelper.php"; // Načtení nové pomocné třídy pro výstup dat

class requests extends ResponseHelper
{
    private $method;
    private $GETdata;
    private $POSTdata;
    private $ser;
    private $conn;
    
    // Instance databázových modelů
    private $firms;
    private $contacts;
    private $workshops;
    private $stats;
    private $meets;
    private $gifts;
    private $events;
    private $campaigns;
    private $practices;
    private $cvInvitations;

    public function __construct($conn)
    {
        $this->conn = $conn;
        $this->initModels();
        $this->processRequest();
    }

    private function initModels()
    {
        $this->firms = new firms($this->conn);
        $this->contacts = new contacts($this->conn);
        $this->workshops = new workshops($this->conn);
        $this->stats = new stats($this->conn);
        $this->meets = new meets($this->conn);
        $this->gifts = new gifts($this->conn);
        $this->events = new events($this->conn);
        $this->campaigns = new campaigns($this->conn);
        $this->practices = new practices($this->conn);
        $this->cvInvitations = new cvInvitations($this->conn);
    }

    private function processRequest()
    {
        $url = $_SERVER['REQUEST_URI'];
        $url = str_replace("/rest.php", "", $url); 
        $url = str_replace("/v3", "", $url); 
        $url = str_replace("//", "/", $url); 

        $this->method = $_SERVER["REQUEST_METHOD"];
        $uri = explode('/', $url);

        if (isset($uri[1]) && $uri[1] === 'session') {
            print_r($_SESSION);
            print_r($_COOKIE);
            exit;
        }

        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);

        // Směrování požadavku podle typu HTTP metody
        switch ($this->method) {
            case 'GET':
                $this->handleGet($uri);
                break;
            case 'POST':
                $this->handlePost($uri, $input);
                break;
            case 'PUT':
                $this->handlePut($uri, $input);
                break;
            case 'DELETE':
                $this->handleDelete($uri);
                break;
            default:
                $this->output("err");
        }
    }

    // --- OBSLUHA JEDNOTLIVÝCH HTTP METOD ---

    private function handleGet($uri)
    {
        $endpoint = isset($uri[1]) ? $uri[1] : '';
        $param = isset($uri[2]) ? $uri[2] : null;
        $subParam = isset($uri[3]) ? $uri[3] : null;

        // Fallback pro starší špatně strukturované cesty
        if ($endpoint === 'firms' || $param === 'list' || $param === 'form' || $param === 'getFirmsNotCont') {
            $endpoint = 'firms_legacy';
        }

        switch ($endpoint) {
            case 'user':
                $this->handleUserSession();
                break;
            case 'copyCampaign':
                $this->output($this->campaigns->copyCampaign($param));
                break;
            case 'cvinvitations':
                $this->output($this->cvInvitations->getcvIvnvitatios($param));
                break;
            case 'campaignAttachment':
                $this->downloadAttachment($param);
                break;
            case 'campaignExport':
                $this->output($this->campaigns->getCampaignExport($param ? $param : 0));
                break;
            case 'campaigns':
                if ($param === 'getCampaignSending') {
                    $this->output($this->campaigns->getCampaignSending($subParam ? $subParam : 0));
                } else {
                    $this->output($this->campaigns->getCampaigns());
                }
                break;
            case 'getCampaignContacts':
                $this->output($this->campaigns->getCampaignContacts($param));
                break;
            case 'campaign':
                $this->output($this->campaigns->getCampaign($param));
                break;
            case 'event':
                $this->output($this->events->getevent($param));
                break;
            case 'checkfirmExist':
                $this->output($this->firms->checkIfFirmExist($param));
                break;
            case 'events':
                if ($param === 'generateICS') {
                    $this->events->generateICS($subParam);
                } else if ($param === 'getFutureEvents') {
                    $this->output($this->events->getFutureEvents());
                } else {
                    $this->output($this->events->getEvents($param));
                }
                break;
            case 'contacts':
                if ($param === 'search') {
                    $this->output($this->contacts->search($subParam));
                } else if ($param === 'exportVcf') {
                    $exporter = new ContactVcfExporter($this->conn);
                    $exporter->export($_GET); 
                    exit;
                } else {
                    $this->output($this->contacts->getFirmContacts($param));
                }
                break;
            case 'firms_legacy':
                if ($param === 'list' && $subParam === 'filter') {
                    $this->output($this->firms->getFirmsFilter($_GET));
                } else if ($param === 'list') {
                    $this->output($this->firms->getFirms());
                } else if ($param === 'getFirmsNotCont') {
                    $this->output($this->firms->getFirmsNotCont());
                } else if ($param === 'form') {
                    $this->output($subParam ? $this->firms->getFirmAndForm($subParam) : $this->firms->getFirmForm());
                }
                break;
            case 'firm':
                if ($param === 'contactsList') {
                    $this->output($this->firms->contactsList());
                } else {
                    $this->output($this->firms->getFirm($param));
                }
                break;
            case 'workshops':
                $this->output($this->workshops->getworkshops($param));
                break;
            case 'stats':
                $y = $subParam ? intval($subParam) : 0;
                if ($param === 'invitations') $this->output($this->stats->getInvitations(1, $y));
                else if ($param === 'cvcount') $this->output($this->stats->getCvCount($y));
                else if ($param === 'practices') $this->output($this->stats->getAllPractices($y));
                else if ($param === 'getStatBySYears') $this->output($this->stats->getStatBySYears());
                else if ($param === 'getAllCVInvitations') $this->output($this->stats->getAllCVInvitations());
                else if ($param === 'getFirmStats') $this->output($this->stats->getFirmStats());
                else if ($param === 'export') $this->output($this->stats->export());
                else if ($param === 'getAllWSs') $this->output($this->stats->getAllWSs($y));
                else if ($param === 'getAllGifts') $this->output($this->stats->getAllGifts($y));
                else if ($param === 'getAllMeets') $this->output($this->stats->getAllMeets($y));
                else if ($param === 'getTopCompanies') $this->output($this->stats->getTopCompanies($y));
                else if ($param === 'getAllNotActivity') $this->output($this->stats->getAllNotActivity($y));
                else $this->output($this->stats->getAll());
                break;
            case 'columnsFilter':
                $this->output($this->firms->getColmVisibilityFilter());
                break;
            case 'columns':
                $this->output($this->firms->getColmVisibility());
                break;
            case 'columnsList':
                $this->output($this->firms->getColms());
                break;
            case 'meets':
                $this->output($this->meets->getMeets($param));
                break;
            case 'gifts':
                $this->output($this->gifts->getgifts($param));
                break;
            case 'practices':
                $this->output($this->practices->getpractices($param ? $param : 0));
                break;
            default:
                $this->output("err");
        }
    }

    private function handlePost($uri, $input)
    {
        $endpoint = isset($uri[1]) ? $uri[1] : '';
        $param = isset($uri[2]) ? $uri[2] : null;

        switch ($endpoint) {
            case 'cvinvitations': $this->output($this->cvInvitations->save($input)); break;
            case 'campaigns': $this->output($this->campaigns->insert($input)); break;
            case 'getCampaignSeindingExport': $this->output($this->campaigns->getCampaignSeindingExport($param, $input)); break;
            case 'campaignContacts': $this->output($this->campaigns->campaignContactsUpdate($param, $input)); break;
            case 'events': $this->output($this->events->insert($input)); break;
            case 'firms': $this->output($this->firms->insert($input)); break;
            case 'contacts': $this->output($this->contacts->insertContacts($input)); break;
            case 'workshops': $this->output($this->workshops->insert($input)); break;
            case 'columns': $this->output($this->firms->saveColmVisibility($input)); break;
            case 'gifts': $this->output($this->gifts->insert($input)); break;
            case 'column': $this->output($this->firms->addColm($input["name"], $input["type"])); break;
            case 'meets': $this->output($this->meets->insert($input)); break;
            case 'practices': $this->output($this->practices->save($input)); break;
            default: $this->output("err");
        }
    }

    private function handlePut($uri, $input)
    {
        $endpoint = isset($uri[1]) ? $uri[1] : '';

        switch ($endpoint) {
            case 'campaigns': $this->output($this->campaigns->update($input)); break;
            case 'firms': $this->output($this->firms->updateFirm($input)); break;
            case 'events': $this->output($this->events->update($input)); break;
            case 'contacts': $this->output($this->contacts->updateContacts($input)); break;
            case 'workshops': $this->output($this->workshops->update($input)); break;
            case 'meets': $this->output($this->meets->update($input)); break;
            case 'gifts': $this->output($this->gifts->update($input)); break;
            case 'column': $this->output($this->firms->updateColmn($input)); break;
            default: $this->output("err");
        }
    }

    private function handleDelete($uri)
    {
        $endpoint = isset($uri[1]) ? $uri[1] : '';
        $param = isset($uri[2]) ? $uri[2] : null;

        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);

        switch ($endpoint) {
            case 'campaignContacts': $this->output($this->campaigns->deleteCampaignContacts($param, $input)); break;
            case 'campaign': $this->output($this->campaigns->delete($param)); break;
            case 'contacts': $this->output($this->contacts->deleteContact($param)); break;
            case 'events': $this->output($this->events->delete($param)); break;
            case 'workshops': $this->output($this->workshops->delete($param)); break;
            case 'firms': $this->output($this->firms->delete($param)); break;
            case 'meets': $this->output($this->meets->delete($param)); break;
            case 'gifts': $this->output($this->gifts->delete($param)); break;
            case 'column': $this->output($this->firms->deleteColmn($param)); break;
            case 'practices': $this->output($this->practices->delete($param)); break;
            default: $this->output("err");
        }
    }

    // --- POMOCNÉ METODY ---

    private function handleUserSession()
    {
        if (isset($_SESSION["user"])) {
            if ($_SESSION["user"] != null) {
                $this->output(array("user" => $_SESSION["user"]));
            } else {
                $this->output(array("user" => "reader"));
            }
        } else { 
            // Fallback řešení pro localhost
            if (isset($_COOKIE['localhostUser'])) {
                $user = $_COOKIE['localhostUser'];
                if ($user === 'admin') $this->output(array("user" => "admin"));
                else if ($user === 'user') $this->output(array("user" => "reader"));
            } else {
                $this->output(array("user" => "admin")); 
            }
        }
    }

    private function downloadAttachment($id)
    {
        $data = $this->campaigns->getAttachment($id);

        if (!$data || !$data["attachment"]) {
            http_response_code(404);
            echo "Soubor nenalezen";
            exit;
        }

        $filename = $data["attachment_name"];
        $filedata = $data["attachment"]; // binární data (BLOB)

        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"$filename\"");
        header("Content-Length: " . strlen($filedata));

        echo $filedata;
        exit;
    }
}
?>
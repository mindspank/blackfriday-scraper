SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT=0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `deals` (
  `store` longtext,
  `product` longtext,
  `price` longtext,
  `category` longtext,
  `storehours` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

COMMIT;
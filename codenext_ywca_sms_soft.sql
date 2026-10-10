-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 23, 2026 at 02:17 PM
-- Server version: 11.4.10-MariaDB-log
-- PHP Version: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `codenext_ywca_sms_soft`
--

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `class_name`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Hate Khori', 1, '2024-06-04 11:33:22', '2024-06-04 11:33:22'),
(2, 'Play', 1, '2024-06-04 11:33:40', '2024-06-04 11:33:40'),
(3, 'Nursery', 1, '2024-06-04 11:33:53', '2024-06-04 11:33:53'),
(4, 'KG', 1, '2024-06-04 11:34:03', '2024-06-04 11:34:03'),
(5, 'One', 1, '2024-06-04 11:34:12', '2024-06-04 11:34:12'),
(6, 'Two', 1, '2024-06-04 11:34:24', '2024-06-04 11:34:24'),
(7, 'Three', 1, '2024-06-04 11:34:36', '2024-06-04 11:34:36');

-- --------------------------------------------------------

--
-- Table structure for table `gradients`
--

CREATE TABLE `gradients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `father_name` varchar(255) NOT NULL,
  `mother_name` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `nid` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(2, '2023_07_11_152531_create_users', 1),
(3, '2024_05_02_082050_create_sections_table', 1),
(4, '2024_05_02_082426_create_classes_table', 1),
(5, '2024_05_02_082755_create_sessions_table', 1),
(6, '2024_05_02_082927_create_groups_table', 1),
(7, '2024_05_02_083255_create_students_table', 1),
(8, '2024_05_02_084249_create_gradients_table', 1),
(9, '2024_05_02_090539_create_student_registrations_table', 1),
(10, '2024_05_06_095142_create_shifts_table', 1),
(11, '2024_05_08_070704_create_teachers_table', 1),
(12, '2024_05_08_121747_create_staff_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(102, 'App\\Models\\User', 1, 'authToken', 'db750ffb6d2a32384d75e3d14887b9743204a74c139585648f21257c3625de10', '[\"*\"]', '2024-07-03 08:02:41', NULL, '2024-07-03 07:58:39', '2024-07-03 08:02:41'),
(103, 'App\\Models\\User', 1, 'authToken', '9e2e307f8d01762093794b187f2ac19b6baa33e686f11a02b4fed55779c59005', '[\"*\"]', '2024-07-03 13:13:05', NULL, '2024-07-03 13:12:33', '2024-07-03 13:13:05'),
(104, 'App\\Models\\User', 1, 'authToken', '0d6c75a735ba654306beabb61410640bcfd732dd989fb86e826464d21cb29a02', '[\"*\"]', '2024-07-04 08:12:53', NULL, '2024-07-04 04:55:54', '2024-07-04 08:12:53'),
(105, 'App\\Models\\User', 1, 'authToken', '9377b309eded38ce0bfc7247b57b6331fa85eed41f715161847e5f9cc6ae3758', '[\"*\"]', '2024-07-04 08:16:21', NULL, '2024-07-04 08:14:27', '2024-07-04 08:16:21'),
(106, 'App\\Models\\User', 1, 'authToken', '39cff49fa477d4b6501df22155d91971220e6f4ad03d5bf6d6b642dccbdcb323', '[\"*\"]', '2024-07-04 08:51:15', NULL, '2024-07-04 08:43:56', '2024-07-04 08:51:15'),
(107, 'App\\Models\\User', 1, 'authToken', '040c873389384cbad5506258b291ce46b72ed3e91288ff7a886bb9e9a21d0ce6', '[\"*\"]', '2024-07-04 09:33:03', NULL, '2024-07-04 09:21:25', '2024-07-04 09:33:03'),
(108, 'App\\Models\\User', 1, 'authToken', '2085784cbeb66bb07af622f4086f6dfeee6b12047abd15334c0d355975ec528a', '[\"*\"]', '2024-07-07 08:31:47', NULL, '2024-07-07 08:23:57', '2024-07-07 08:31:47'),
(109, 'App\\Models\\User', 1, 'authToken', '178275346552c672625f7f9f1db4335083dd643fe6b8192956a3e771630b588e', '[\"*\"]', '2024-07-07 17:53:06', NULL, '2024-07-07 17:46:57', '2024-07-07 17:53:06'),
(110, 'App\\Models\\User', 1, 'authToken', '10f77031ac201ea1be54cb1be7a1c9ae1c38535905d030b6e800d083e47e41cd', '[\"*\"]', '2024-07-08 16:01:01', NULL, '2024-07-08 16:00:52', '2024-07-08 16:01:01'),
(111, 'App\\Models\\User', 1, 'authToken', '8a35e0a564944f76f67631b826dcc9bde7ac5e36d0d0a8b786c96e83c3998c79', '[\"*\"]', '2024-07-09 09:14:08', NULL, '2024-07-09 09:14:07', '2024-07-09 09:14:08'),
(112, 'App\\Models\\User', 1, 'authToken', 'bc1ba195e3173b112d4b5fab7007a981d3a8b9e7701380f398d3f5e44d384934', '[\"*\"]', '2024-07-10 08:19:21', NULL, '2024-07-10 07:39:16', '2024-07-10 08:19:21'),
(113, 'App\\Models\\User', 1, 'authToken', '59d7c016132077bdf5307c8beb5eedb2b7318287e3627aea0257d4e861a455fa', '[\"*\"]', '2024-07-10 08:20:27', NULL, '2024-07-10 08:20:21', '2024-07-10 08:20:27'),
(114, 'App\\Models\\User', 1, 'authToken', 'b9793d25958f57d812b7ebba8037e4d8253b6ed5bfe84b4c0d032ecfbe82ad19', '[\"*\"]', '2024-07-11 08:44:06', NULL, '2024-07-11 08:25:36', '2024-07-11 08:44:06'),
(115, 'App\\Models\\User', 1, 'authToken', 'ecf0b4e3ef8dd9b94352e5554ef3ac005de5b61aaf5c0696ba043460a197a0e4', '[\"*\"]', '2024-07-13 12:07:09', NULL, '2024-07-13 12:05:13', '2024-07-13 12:07:09'),
(116, 'App\\Models\\User', 1, 'authToken', 'f43684e995f5851b068894a61a27ba11e2cdf0f31155fd7dc90d151be1a01564', '[\"*\"]', '2024-07-14 09:32:10', NULL, '2024-07-14 09:32:08', '2024-07-14 09:32:10'),
(117, 'App\\Models\\User', 1, 'authToken', '8ec770cc6bfbe05d8405d7057fbeac1f23d4b7a22a5f1dfb76985121fa1b7814', '[\"*\"]', '2024-07-14 10:09:50', NULL, '2024-07-14 09:54:39', '2024-07-14 10:09:50'),
(118, 'App\\Models\\User', 1, 'authToken', 'f7b56190254ae173ffd58c49ac9054454cbb3615e087c2bb4931aeca1cb46266', '[\"*\"]', '2024-07-15 09:33:39', NULL, '2024-07-15 09:33:34', '2024-07-15 09:33:39'),
(119, 'App\\Models\\User', 1, 'authToken', '2d1bafca56814e0317e36eca6acecbaf385ac60bea4e8eff0d835396ffdfb2bc', '[\"*\"]', '2024-07-15 11:49:07', NULL, '2024-07-15 11:49:00', '2024-07-15 11:49:07'),
(120, 'App\\Models\\User', 1, 'authToken', '55bf873955908eec0a15499444d85c766e5712d806eee422d7c9e2fbbdae7f20', '[\"*\"]', '2024-07-16 10:04:08', NULL, '2024-07-16 09:55:18', '2024-07-16 10:04:08'),
(121, 'App\\Models\\User', 1, 'authToken', '28a62567ae210b2033e736a99c8a6c4b9c144e08e29f252fa4ef4e5bfe0a48d2', '[\"*\"]', '2024-07-17 17:50:03', NULL, '2024-07-17 17:39:25', '2024-07-17 17:50:03'),
(122, 'App\\Models\\User', 1, 'authToken', '9288dba069fcc2a153946e093498e9cf92706ef0b3132c321866019304e0ca95', '[\"*\"]', '2024-07-24 14:13:12', NULL, '2024-07-24 14:12:42', '2024-07-24 14:13:12'),
(123, 'App\\Models\\User', 1, 'authToken', '7d73ca51866c1482ba82aaec17f9385bc0ac9102bd3dd38fcb15761228a36a84', '[\"*\"]', '2024-07-25 11:27:59', NULL, '2024-07-25 11:19:50', '2024-07-25 11:27:59'),
(124, 'App\\Models\\User', 1, 'authToken', '6f115123c2f508adb67c8490e6a68886b154f84eb4b9a61c4fa8c168d2d9d2e7', '[\"*\"]', '2024-07-25 13:21:21', NULL, '2024-07-25 13:21:20', '2024-07-25 13:21:21'),
(125, 'App\\Models\\User', 1, 'authToken', '5a40a5109965577c6b608ca985bf6de9d858749959149b77495a8674848c34bc', '[\"*\"]', '2024-07-27 14:36:39', NULL, '2024-07-27 14:26:02', '2024-07-27 14:36:39'),
(126, 'App\\Models\\User', 1, 'authToken', 'e84c0cdab499599df01b1e25d50adea1c3916fc106ef4670128a7ffd717a5dfd', '[\"*\"]', NULL, NULL, '2024-07-27 14:38:30', '2024-07-27 14:38:30'),
(127, 'App\\Models\\User', 1, 'authToken', '15cf2cdf3ceb8746b9cfd9399b876d1787339d0034022f02ca5ebaab6310d98b', '[\"*\"]', '2024-07-27 14:49:55', NULL, '2024-07-27 14:38:32', '2024-07-27 14:49:55'),
(128, 'App\\Models\\User', 1, 'authToken', '37cdb485245a7c8982f53ecd3cf073044eb07cdf969ef34f24ff1918d854252b', '[\"*\"]', NULL, NULL, '2024-07-27 14:38:47', '2024-07-27 14:38:47'),
(129, 'App\\Models\\User', 1, 'authToken', '82e775344f5230f11639f00c4cbc0356406cd90f778aaff9464b9cb6fa17ed1a', '[\"*\"]', '2024-07-27 16:21:42', NULL, '2024-07-27 16:09:59', '2024-07-27 16:21:42'),
(130, 'App\\Models\\User', 1, 'authToken', 'dce1e181079f93129c8e100b93fe02bfdb036132658ee0ff2d2e15da9fa350cb', '[\"*\"]', '2024-07-28 05:32:57', NULL, '2024-07-28 05:26:56', '2024-07-28 05:32:57'),
(131, 'App\\Models\\User', 1, 'authToken', 'f7933a5e2156f433fa35c38f1230634d3de5edd17ef065539f19205b79b18547', '[\"*\"]', '2024-07-29 10:17:21', NULL, '2024-07-29 10:17:16', '2024-07-29 10:17:21'),
(132, 'App\\Models\\User', 1, 'authToken', 'f614cebdf301ab5f9d2f88b947d991d9ab54854e248eb22cc048a6fb6d7e5dfc', '[\"*\"]', '2024-07-30 08:01:25', NULL, '2024-07-30 07:42:16', '2024-07-30 08:01:25'),
(133, 'App\\Models\\User', 1, 'authToken', 'a6f6a9f7e2fecd6fb9bfa1148b7830f2248768d7b3c3a7b874a27d1efe6dcb3b', '[\"*\"]', '2024-07-30 08:44:32', NULL, '2024-07-30 08:44:26', '2024-07-30 08:44:32'),
(134, 'App\\Models\\User', 1, 'authToken', '3bcc7de61a7d8d0ea1eefe8fee7af939522e6d519daa94eda39f2cb5979f804e', '[\"*\"]', NULL, NULL, '2024-08-01 06:43:45', '2024-08-01 06:43:45'),
(135, 'App\\Models\\User', 1, 'authToken', '2ca3168064af9e5376025442981d4f57ae33faf7e6d2f0c45ea52bd6da3bab2d', '[\"*\"]', '2024-08-01 07:08:58', NULL, '2024-08-01 06:46:41', '2024-08-01 07:08:58'),
(136, 'App\\Models\\User', 1, 'authToken', 'bca40c6b8cb641b51d1a6e3c8149445f4781ed1145b49c8850a9290b0b681cf2', '[\"*\"]', '2024-08-01 06:51:58', NULL, '2024-08-01 06:51:46', '2024-08-01 06:51:58'),
(137, 'App\\Models\\User', 1, 'authToken', '310a2fe4be9cc271e16370fb4610828963275299e1def116247e149a82a09fd5', '[\"*\"]', '2024-08-01 06:52:06', NULL, '2024-08-01 06:51:57', '2024-08-01 06:52:06'),
(138, 'App\\Models\\User', 1, 'authToken', 'ac6eb66e4615796839e13fd86a687ae064c9e1658fd1299ea74e5c98d3fe4ae6', '[\"*\"]', '2024-08-01 06:52:32', NULL, '2024-08-01 06:52:00', '2024-08-01 06:52:32'),
(139, 'App\\Models\\User', 1, 'authToken', 'bb091080c92bf091f240b249b62920719fefb2ddb74bf1f0fb455b1cae0ae6b9', '[\"*\"]', '2024-08-03 08:02:27', NULL, '2024-08-01 07:49:58', '2024-08-03 08:02:27'),
(140, 'App\\Models\\User', 1, 'authToken', '962b54b4488999d2a8da059b874f0a4a3aefef58541ad3b705275385d722b802', '[\"*\"]', '2024-09-18 00:43:23', NULL, '2024-08-01 08:05:49', '2024-09-18 00:43:23'),
(141, 'App\\Models\\User', 1, 'authToken', '931cbf3736a1ea3aeb7840655745feb34fe8dd797c6b1a2f479ef11b2fb1b2e7', '[\"*\"]', '2024-08-01 09:20:38', NULL, '2024-08-01 08:10:36', '2024-08-01 09:20:38'),
(142, 'App\\Models\\User', 1, 'authToken', 'bc75ada7c8b17937eb2807a77dd329f628b42ebc28e776f51d302c2a6baa3b72', '[\"*\"]', NULL, NULL, '2024-08-01 08:10:49', '2024-08-01 08:10:49'),
(143, 'App\\Models\\User', 1, 'authToken', 'b171e12da368579eee0e5573a9440d7feb1cedc73b6aba83587e02d7347f0a71', '[\"*\"]', '2024-08-01 08:41:56', NULL, '2024-08-01 08:41:36', '2024-08-01 08:41:56'),
(144, 'App\\Models\\User', 1, 'authToken', 'a340bb3f76e8bd90b10f6f238927a5dd4ebf5363046302877741fddefe0663e4', '[\"*\"]', '2024-08-01 11:05:42', NULL, '2024-08-01 10:31:13', '2024-08-01 11:05:42'),
(145, 'App\\Models\\User', 1, 'authToken', 'b4e5476592a1fc97de863e626d26348dd2852a65a5a0b4d0b877c9c9d2acb6e8', '[\"*\"]', '2024-08-01 11:09:02', NULL, '2024-08-01 11:07:27', '2024-08-01 11:09:02'),
(146, 'App\\Models\\User', 1, 'authToken', 'dca71c9dae491beaac60833277e87cf448c576b421015671ddb95ed5f06578f1', '[\"*\"]', '2024-08-01 11:23:25', NULL, '2024-08-01 11:11:21', '2024-08-01 11:23:25'),
(147, 'App\\Models\\User', 1, 'authToken', 'e1ba7ff85424842d4143ca1526cdf924a58786afca4d81f57e171d9addf6016a', '[\"*\"]', '2024-08-03 08:05:58', NULL, '2024-08-03 08:02:36', '2024-08-03 08:05:58'),
(148, 'App\\Models\\User', 1, 'authToken', '600f8a3f541dff4c7bc0f522b428171be9252f1dfa38eb6dfe23ddb0060d0016', '[\"*\"]', '2024-08-03 08:48:35', NULL, '2024-08-03 08:19:56', '2024-08-03 08:48:35'),
(149, 'App\\Models\\User', 1, 'authToken', 'c6978841467e9a311eaaedaccf220f43f1d20361f9f2af006507926ff1325579', '[\"*\"]', '2024-08-04 06:34:11', NULL, '2024-08-04 06:29:50', '2024-08-04 06:34:11'),
(150, 'App\\Models\\User', 1, 'authToken', '02a95ffdaa7dd2132254da572c4a720d5c5814363bf43013c481b951a6a484cd', '[\"*\"]', '2024-08-06 16:25:00', NULL, '2024-08-06 15:41:52', '2024-08-06 16:25:00'),
(151, 'App\\Models\\User', 1, 'authToken', '8547ba30fd023686af4408a552c5d3db22d8dd24a43654eb416febf8c08c0b20', '[\"*\"]', '2024-08-06 16:19:06', NULL, '2024-08-06 16:08:50', '2024-08-06 16:19:06'),
(152, 'App\\Models\\User', 1, 'authToken', '685ba8f8859f0b08a35446b6d502b24aaaef1b663a1f2fc6e03bf58f2f402f3d', '[\"*\"]', '2024-08-06 17:12:09', NULL, '2024-08-06 16:57:54', '2024-08-06 17:12:09'),
(153, 'App\\Models\\User', 1, 'authToken', '0aae1331d7ff47c5c9179254615c173b897bc7bb3d75d1b7b62f7d73b5850a0e', '[\"*\"]', '2024-08-14 09:54:41', NULL, '2024-08-14 08:30:33', '2024-08-14 09:54:41'),
(154, 'App\\Models\\User', 1, 'authToken', 'cdb2daf1ac1422f5849072835848cc837c347a17420f5dac7b04eb92af056014', '[\"*\"]', '2024-08-15 08:32:30', NULL, '2024-08-15 08:32:21', '2024-08-15 08:32:30'),
(155, 'App\\Models\\User', 1, 'authToken', 'f4e9f3096fe6e0505a73ade35487039cce02290c3243758827e1257ceac80ff5', '[\"*\"]', '2024-08-15 09:08:49', NULL, '2024-08-15 08:45:41', '2024-08-15 09:08:49'),
(156, 'App\\Models\\User', 1, 'authToken', '5cadfc68b4aebf73f665b3cd88ddade85fc3f160e3223282189284679cf03680', '[\"*\"]', '2024-08-21 07:43:52', NULL, '2024-08-18 08:21:30', '2024-08-21 07:43:52'),
(157, 'App\\Models\\User', 1, 'authToken', '21bc22d5c76ea0a33e213f407e662c16de20ceecbe885f1736db5880f7d40f02', '[\"*\"]', '2024-08-18 08:29:29', NULL, '2024-08-18 08:28:40', '2024-08-18 08:29:29'),
(158, 'App\\Models\\User', 1, 'authToken', '6d8440b91d96f88e47a590c902793dc8dda6130373091091c4a20a7e2cd86c88', '[\"*\"]', NULL, NULL, '2024-08-18 08:35:37', '2024-08-18 08:35:37'),
(159, 'App\\Models\\User', 1, 'authToken', '42db60e014717acbddceda292606b2cf0726a744287620dbd5a4cd28183245fc', '[\"*\"]', '2024-08-19 09:36:36', NULL, '2024-08-19 09:18:13', '2024-08-19 09:36:36'),
(160, 'App\\Models\\User', 1, 'authToken', '391ec802d14445fd975d51c899577c77e93cfc52b277b97e865eb6aa6558cbbd', '[\"*\"]', '2024-08-20 04:59:52', NULL, '2024-08-20 04:46:00', '2024-08-20 04:59:52'),
(161, 'App\\Models\\User', 1, 'authToken', '1fa58cdf94970891e620526d225fa12979508734d2da1cdc371218daf28268c0', '[\"*\"]', '2024-08-30 12:07:35', NULL, '2024-08-21 04:40:26', '2024-08-30 12:07:35'),
(162, 'App\\Models\\User', 1, 'authToken', '2bbc4f1270647fbb6e38ba14b8750fb56ecf7387675fd9ced1b54d32c4d7b447', '[\"*\"]', '2024-08-31 16:37:39', NULL, '2024-08-31 15:48:28', '2024-08-31 16:37:39'),
(163, 'App\\Models\\User', 1, 'authToken', '15adf7040fff31150b2c19a211e65b351b021eab584c0cb066a11ea3eb1e7c90', '[\"*\"]', '2024-09-02 02:01:42', NULL, '2024-09-02 01:20:11', '2024-09-02 02:01:42'),
(164, 'App\\Models\\User', 1, 'authToken', '61265a626d76d281e03b764032463a761a9ff0704c5899e65196cd929e47e88a', '[\"*\"]', '2024-09-04 04:55:29', NULL, '2024-09-04 04:54:37', '2024-09-04 04:55:29'),
(165, 'App\\Models\\User', 1, 'authToken', '729cf1365560293d5a614327cc15802f38550aeb8d82fffb3f25e3f1e9d73538', '[\"*\"]', '2024-09-05 13:21:27', NULL, '2024-09-05 13:20:40', '2024-09-05 13:21:27'),
(166, 'App\\Models\\User', 1, 'authToken', 'd390f94fdca6e4c5b532cfe94157b6e9c0e53cc5fc2ca55d8e05a087cb830f8f', '[\"*\"]', '2024-09-07 13:24:13', NULL, '2024-09-07 13:24:09', '2024-09-07 13:24:13'),
(167, 'App\\Models\\User', 1, 'authToken', '27a60dea3d0cdbce55c12b74256032b664933a8043be60004a4ca552f8519cc0', '[\"*\"]', '2024-09-16 00:56:15', NULL, '2024-09-16 00:56:13', '2024-09-16 00:56:15'),
(168, 'App\\Models\\User', 1, 'authToken', '503481ffe321a20528572201aa4e8a08f87799ff61a3f024e42731a87e602327', '[\"*\"]', '2024-10-05 21:52:15', NULL, '2024-10-05 21:33:57', '2024-10-05 21:52:15'),
(169, 'App\\Models\\User', 1, 'authToken', '51f3e34cf16e65dd6f5eb0de6c50bf283f57e6a7b9e3fb97819afd38c3057971', '[\"*\"]', '2024-10-05 22:15:05', NULL, '2024-10-05 22:15:03', '2024-10-05 22:15:05'),
(170, 'App\\Models\\User', 1, 'authToken', 'a3da6137f2692ac2106c047ca3ffe4ee39c95587795eeb09345240f733b61078', '[\"*\"]', '2024-10-30 08:55:27', NULL, '2024-10-30 08:55:25', '2024-10-30 08:55:27'),
(175, 'App\\Models\\User', 2, 'authToken', 'a747ca778fd44952a8df6cc89445ab5a8aa5b662b34f54162a21d4000a636066', '[\"*\"]', '2024-11-13 11:22:31', NULL, '2024-11-13 10:41:44', '2024-11-13 11:22:31'),
(176, 'App\\Models\\User', 1, 'authToken', '4b831bd714cf48be691c6b7055275509f7af5a2e796e19a43af9d599a05dfeed', '[\"*\"]', '2024-12-19 03:52:17', NULL, '2024-12-19 03:51:51', '2024-12-19 03:52:17'),
(177, 'App\\Models\\User', 1, 'authToken', '1d0a8a9cb2ec1186a088d54fd072f30ef82a83719424f653e19a51dccb94cee8', '[\"*\"]', '2024-12-22 05:34:18', NULL, '2024-12-22 04:00:21', '2024-12-22 05:34:18'),
(178, 'App\\Models\\User', 1, 'authToken', 'cecf90ce70240007b52c6231d4e4ceac1f4adb888f4b68c9ba056b617510d7e3', '[\"*\"]', '2024-12-23 08:59:01', NULL, '2024-12-23 08:21:14', '2024-12-23 08:59:01'),
(179, 'App\\Models\\User', 1, 'authToken', '0dd581c589a9bb6ef239b859f3e826f3ca506b96d00f547da80f70bfce137b6f', '[\"*\"]', '2024-12-28 14:12:56', NULL, '2024-12-28 14:12:51', '2024-12-28 14:12:56'),
(180, 'App\\Models\\User', 1, 'authToken', '23747bec85cf8b40683dfb73839fd3529567a9cc2e700290ebf4b0d83ce9fc25', '[\"*\"]', '2025-01-06 12:16:46', NULL, '2025-01-06 12:16:45', '2025-01-06 12:16:46'),
(181, 'App\\Models\\User', 1, 'authToken', '33d50da72d0d7dcdfe8b936a0915059b577d0f06e77f090fe70d497823f44157', '[\"*\"]', '2025-01-08 03:35:44', NULL, '2025-01-08 03:33:42', '2025-01-08 03:35:44'),
(182, 'App\\Models\\User', 1, 'authToken', 'ef0030d7177107bcec7f72ef28b20dde3d65eea52c443e82c46808ec23595395', '[\"*\"]', '2025-01-21 08:11:12', NULL, '2025-01-21 03:16:42', '2025-01-21 08:11:12'),
(183, 'App\\Models\\User', 1, 'authToken', '34d6a10a030b784a644e0570c8b50ac79d0cdf7b15516b38e8f648412f5a9107', '[\"*\"]', '2025-01-22 02:02:12', NULL, '2025-01-21 20:39:21', '2025-01-22 02:02:12'),
(184, 'App\\Models\\User', 1, 'authToken', 'c69ef824bf1f52972a9714e77de48dbf7d3309c3042fa7ba9aabbd87551ed41f', '[\"*\"]', '2025-01-23 01:45:54', NULL, '2025-01-22 20:39:17', '2025-01-23 01:45:54'),
(185, 'App\\Models\\User', 1, 'authToken', 'e4bc6bb689e5060fae0120c0303f81382d75858ece77916fcb708790c1f63967', '[\"*\"]', '2025-01-26 01:43:49', NULL, '2025-01-25 20:18:46', '2025-01-26 01:43:49'),
(186, 'App\\Models\\User', 1, 'authToken', '03d783602c42851e02dbe58607de055c7eca849218249df25b5b6c791c7f7684', '[\"*\"]', '2025-01-26 20:57:23', NULL, '2025-01-26 20:45:50', '2025-01-26 20:57:23'),
(187, 'App\\Models\\User', 1, 'authToken', '18eea77dfcd87ef931579943318ba26fe0fa618f1a2ebf81f9b6864f275f6c36', '[\"*\"]', '2025-01-26 21:31:15', NULL, '2025-01-26 21:22:36', '2025-01-26 21:31:15'),
(188, 'App\\Models\\User', 1, 'authToken', '8dc0f1c12c58ba94b09475a94a521893e8e6f583672b33818bfb44cd15118afb', '[\"*\"]', '2025-01-27 01:20:41', NULL, '2025-01-26 23:50:54', '2025-01-27 01:20:41'),
(189, 'App\\Models\\User', 1, 'authToken', '21d48d30989f3d6daf4756dd7ab21ae6f85d7b07a8c8609f02ff65d433f7075e', '[\"*\"]', '2025-02-02 00:11:14', NULL, '2025-02-02 00:09:25', '2025-02-02 00:11:14'),
(190, 'App\\Models\\User', 1, 'authToken', '20d84104e0ce2eb1067c78e406bd33f49343d298af791a7dfe77f32234abceda', '[\"*\"]', '2025-02-02 00:57:29', NULL, '2025-02-02 00:11:16', '2025-02-02 00:57:29'),
(191, 'App\\Models\\User', 1, 'authToken', '278e0a57fcaca404bc9690f417fed358b979efc37d7208ece27bb42c92f582fd', '[\"*\"]', '2025-02-03 21:35:41', NULL, '2025-02-03 21:22:53', '2025-02-03 21:35:41'),
(192, 'App\\Models\\User', 1, 'authToken', 'fcc930ae9a3da5135efa9f9d20446c57e39a6896dc6a6de4a5ca6b7dccb8c269', '[\"*\"]', '2025-02-04 00:27:08', NULL, '2025-02-04 00:27:00', '2025-02-04 00:27:08'),
(193, 'App\\Models\\User', 1, 'authToken', '570af3cf523d5ab57f89875bfd78799423c433cbdcd608fe2e1888f3781cd3c2', '[\"*\"]', '2025-02-10 00:31:42', NULL, '2025-02-10 00:27:28', '2025-02-10 00:31:42'),
(194, 'App\\Models\\User', 1, 'authToken', '9d2e232ed55df718f846a14e32f1ab6ac36897cee98f7de1f7a1999b9f3d551e', '[\"*\"]', '2025-02-11 21:19:58', NULL, '2025-02-11 20:41:34', '2025-02-11 21:19:58'),
(195, 'App\\Models\\User', 1, 'authToken', 'dbb9b69cca6e52a3cd5a0a5a12d079acec0728f7e028fb732c162b18104751be', '[\"*\"]', NULL, NULL, '2025-03-07 12:00:26', '2025-03-07 12:00:26'),
(196, 'App\\Models\\User', 1, 'authToken', '186cad436ade8f597353532b8ee635c915474e95e82989986c42f2cbbdcb7606', '[\"*\"]', NULL, NULL, '2025-03-07 12:00:30', '2025-03-07 12:00:30'),
(197, 'App\\Models\\User', 1, 'authToken', 'c71b618ee900ab01a4e70529949d3fb0b94dc4cecb2823cd95c5e2302b514773', '[\"*\"]', '2025-04-09 07:31:25', NULL, '2025-04-09 07:30:12', '2025-04-09 07:31:25'),
(198, 'App\\Models\\User', 1, 'authToken', '783649c0a0b0dfb924eebda912e87d2fc94318d5fca9881bdaed7e8bf0a969af', '[\"*\"]', '2025-05-20 12:40:14', NULL, '2025-05-20 12:40:11', '2025-05-20 12:40:14'),
(199, 'App\\Models\\User', 1, 'authToken', '4bef60d584c4891cbebcc11bc4064e967dddba9f824359a6f394a7f6acb7dc07', '[\"*\"]', '2025-05-26 01:38:07', NULL, '2025-05-26 01:37:55', '2025-05-26 01:38:07'),
(200, 'App\\Models\\User', 1, 'authToken', 'f311f337e4624c027c02aee00113e2a62451197a52cc877e86e7b3086380568c', '[\"*\"]', '2025-05-27 00:16:41', NULL, '2025-05-27 00:16:17', '2025-05-27 00:16:41'),
(201, 'App\\Models\\User', 1, 'authToken', '5b70b9e6a805c53805b3eff346010aceaa46c2f760a9b979566d4272886db9ac', '[\"*\"]', '2025-05-27 00:19:13', NULL, '2025-05-27 00:19:06', '2025-05-27 00:19:13'),
(202, 'App\\Models\\User', 1, 'authToken', '601f0885ae6b9f95dbad7dc6e54944abcd219454f129692edf589db7a47b29ae', '[\"*\"]', '2025-05-27 00:20:33', NULL, '2025-05-27 00:20:30', '2025-05-27 00:20:33'),
(203, 'App\\Models\\User', 1, 'authToken', '7eaca83d9abc13bfb73fe3e4089ac4cc231197536c0f02c04229c5fa6da7dbc0', '[\"*\"]', '2025-05-27 00:52:47', NULL, '2025-05-27 00:50:45', '2025-05-27 00:52:47'),
(204, 'App\\Models\\User', 1, 'authToken', 'f78e2cba935639586493ebc30cca0aaa7f0217950265ccc79303c784bf48d70a', '[\"*\"]', '2025-05-27 00:59:37', NULL, '2025-05-27 00:58:15', '2025-05-27 00:59:37'),
(205, 'App\\Models\\User', 1, 'authToken', '7eb7401805aff1f5a974f540ca47fe12553e25c715652c711d9aa6bac70be382', '[\"*\"]', '2025-05-27 01:03:43', NULL, '2025-05-27 01:03:35', '2025-05-27 01:03:43'),
(206, 'App\\Models\\User', 1, 'authToken', '17f71d5dc4ccbd79e30bacee603cb1afdd987d95df95e73279dd77bff1498f45', '[\"*\"]', '2025-05-27 01:05:51', NULL, '2025-05-27 01:05:44', '2025-05-27 01:05:51'),
(207, 'App\\Models\\User', 1, 'authToken', 'e1e1227a82ebf47ab7b356c26b1a8ac164f512480cd3c6e252331d7322b0ca1e', '[\"*\"]', '2025-05-27 02:06:28', NULL, '2025-05-27 01:51:52', '2025-05-27 02:06:28'),
(208, 'App\\Models\\User', 1, 'authToken', '5679fa1063c719b1249e315f8a048ef8c77ab194ae2fe1c84a773d268551311b', '[\"*\"]', '2025-05-27 10:38:49', NULL, '2025-05-27 10:08:53', '2025-05-27 10:38:49'),
(209, 'App\\Models\\User', 1, 'authToken', '0bb879c3a08cd2624512b61e6dedc76c36848a90488e63d3997f1dda1f6c2f44', '[\"*\"]', '2025-05-27 22:51:26', NULL, '2025-05-27 22:51:13', '2025-05-27 22:51:26'),
(210, 'App\\Models\\User', 1, 'authToken', 'e11b081ccf101132766a504418e6aa0356acd2160baf27a641a3df2482385261', '[\"*\"]', '2025-05-31 06:46:56', NULL, '2025-05-31 06:43:26', '2025-05-31 06:46:56'),
(211, 'App\\Models\\User', 1, 'authToken', '8231a0b16d3f73e228388312062f40e640d8dc5ecb0e5b7edb69a4dc5e345409', '[\"*\"]', '2025-06-06 23:37:50', NULL, '2025-06-06 23:37:18', '2025-06-06 23:37:50'),
(212, 'App\\Models\\User', 1, 'authToken', '7dffe9eb67aa53c8c00fe8e441f43a299c98a2430e59606d0b9542aac6c0256a', '[\"*\"]', '2025-06-19 11:40:50', NULL, '2025-06-19 11:40:49', '2025-06-19 11:40:50'),
(213, 'App\\Models\\User', 1, 'authToken', 'ccebd08d2c3b072772fe3990bce97146e7c365f662d848b687f2bd3fee9d0f04', '[\"*\"]', '2025-07-08 03:49:42', NULL, '2025-07-08 03:49:30', '2025-07-08 03:49:42'),
(214, 'App\\Models\\User', 1, 'authToken', '6c799b8a8504a1a4e8372c487cc2783eeec3a86656be538ff816d7e4b3865caa', '[\"*\"]', '2025-07-09 06:33:02', NULL, '2025-07-09 06:32:58', '2025-07-09 06:33:02'),
(215, 'App\\Models\\User', 1, 'authToken', '6e8aa0e011afb15bbb6a5431fe4e16532bc730c0d07474910b72340391222b91', '[\"*\"]', '2025-07-23 07:09:18', NULL, '2025-07-23 07:09:11', '2025-07-23 07:09:18'),
(216, 'App\\Models\\User', 1, 'authToken', '714832ea5cc55440963393be40904672f441f2292321c440ae244e881ce6fa4b', '[\"*\"]', '2025-07-23 07:12:37', NULL, '2025-07-23 07:12:32', '2025-07-23 07:12:37'),
(217, 'App\\Models\\User', 1, 'authToken', '9193575094df94598a69e6646b8c24829bc47d94c834bb8553aa803242850491', '[\"*\"]', '2025-07-23 09:47:20', NULL, '2025-07-24 08:57:59', '2025-07-23 09:47:20'),
(218, 'App\\Models\\User', 1, 'authToken', '125df08e9d2141d7d9367c0619ae1bea51a71e60aafeaac841037258c6b0c47b', '[\"*\"]', '2025-07-23 20:01:09', NULL, '2025-07-23 20:01:04', '2025-07-23 20:01:09'),
(219, 'App\\Models\\User', 1, 'authToken', '8142355439fc1106f4e05b95d088358790327812e383c413c8c9f047587f5866', '[\"*\"]', '2025-09-23 01:52:15', NULL, '2025-09-23 01:51:54', '2025-09-23 01:52:15'),
(220, 'App\\Models\\User', 1, 'authToken', '227c0758ccaeab75e00ed7ced0ca8016bb5ef0d686b2fb77728b05beadec70e6', '[\"*\"]', '2025-09-25 06:21:31', NULL, '2025-09-25 06:21:25', '2025-09-25 06:21:31'),
(221, 'App\\Models\\User', 1, 'authToken', '20700d761c4fc4ef84a27e8b0c160ce694f43bbfec37b53b9e4519e7335884cb', '[\"*\"]', '2025-09-25 09:46:01', NULL, '2025-09-25 09:37:04', '2025-09-25 09:46:01'),
(222, 'App\\Models\\User', 1, 'authToken', 'd9d9e93de3a44450559288d4ded119527dbc0d36dbd6ebe67ea4c01c3deb5f38', '[\"*\"]', '2025-11-13 00:32:16', NULL, '2025-11-13 00:32:08', '2025-11-13 00:32:16'),
(223, 'App\\Models\\User', 1, 'authToken', '04d1a133ca4a6b440273ff3486b076ef386ac9ccc437bff72ab6015581a7ea3b', '[\"*\"]', '2026-02-05 04:24:42', NULL, '2026-02-05 04:24:11', '2026-02-05 04:24:42'),
(224, 'App\\Models\\User', 1, 'authToken', '08d23b99c2bd6fdf15ce7034b828dd744c616ed4711203171688e2188e376852', '[\"*\"]', '2026-02-10 06:51:04', NULL, '2026-02-10 06:46:05', '2026-02-10 06:51:04'),
(225, 'App\\Models\\User', 1, 'authToken', '198089b3fb6592c1d1134ebd3a2259a666ac8ca417dbc0b8c3637442c96278a5', '[\"*\"]', '2026-02-10 10:10:11', NULL, '2026-02-10 10:05:59', '2026-02-10 10:10:11'),
(226, 'App\\Models\\User', 1, 'authToken', '7d01899fb56c444168aa30acd0523d8dafc0fe52fac44ac0b9b40f10445006de', '[\"*\"]', '2026-02-11 01:46:13', NULL, '2026-02-11 01:46:01', '2026-02-11 01:46:13'),
(227, 'App\\Models\\User', 1, 'authToken', '10f5e1570ea650f09ec09b65c8e0a59e6201d45c919bf867e1d16801fe37710e', '[\"*\"]', '2026-02-22 21:00:06', NULL, '2026-02-22 21:00:04', '2026-02-22 21:00:06'),
(228, 'App\\Models\\User', 1, 'authToken', 'bc9ce549b2f5b6a040736ebea5ebc6ec3d96d7f158051e799ce2172e3b0d7959', '[\"*\"]', '2026-02-22 21:25:00', NULL, '2026-02-22 21:03:16', '2026-02-22 21:25:00'),
(229, 'App\\Models\\User', 1, 'authToken', '33c86d624695808c8a4da3dced2f054c0e97b7dbdeac0e797825614c7d2734cb', '[\"*\"]', '2026-02-22 22:25:40', NULL, '2026-02-22 21:27:11', '2026-02-22 22:25:40'),
(230, 'App\\Models\\User', 1, 'authToken', '44a437d62da78bf2a779252189968f829b7040f057ce982990d2300cf73bde32', '[\"*\"]', '2026-02-23 01:33:43', NULL, '2026-02-22 22:27:44', '2026-02-23 01:33:43'),
(231, 'App\\Models\\User', 1, 'authToken', '430912720b65ae28c7abc3923916f72f658e79c9338aff30ca556d774c50231e', '[\"*\"]', '2026-03-01 21:13:59', NULL, '2026-03-01 21:13:09', '2026-03-01 21:13:59'),
(232, 'App\\Models\\User', 1, 'authToken', '78ca545704454491bb25bfae202900a129a2ae20605d4aacb15d229b023104ee', '[\"*\"]', '2026-03-04 23:12:46', NULL, '2026-03-04 20:50:37', '2026-03-04 23:12:46'),
(233, 'App\\Models\\User', 1, 'authToken', 'b2009576f1610b57ff09a266d50a659ab29abd73aece4daa9aae2a560e3f33fe', '[\"*\"]', '2026-03-08 01:01:47', NULL, '2026-03-07 20:51:59', '2026-03-08 01:01:47'),
(234, 'App\\Models\\User', 1, 'authToken', 'de2285a31ef9f9c5604c9b866a082216d2f0d03c3263d6f9f381517cae61d44b', '[\"*\"]', '2026-03-09 01:23:12', NULL, '2026-03-08 20:44:10', '2026-03-09 01:23:12'),
(235, 'App\\Models\\User', 1, 'authToken', '86f4f98d3d74be106e3f67cc10bccd9d7209457360c34c041b435e641e8c65b0', '[\"*\"]', '2026-03-09 21:57:12', NULL, '2026-03-09 20:39:46', '2026-03-09 21:57:12'),
(236, 'App\\Models\\User', 1, 'authToken', '391f4058da4b88ee5f4549817c7d1624f29c766cafbbbd8b00c000bb85bfbc59', '[\"*\"]', '2026-03-11 01:35:57', NULL, '2026-03-10 21:16:45', '2026-03-11 01:35:57'),
(237, 'App\\Models\\User', 1, 'authToken', '075742e6269bd8ca8c15812a37d336c1a6ac19df0c932e2edebb70b762a331f7', '[\"*\"]', '2026-04-12 00:42:08', NULL, '2026-04-11 23:48:52', '2026-04-12 00:42:08'),
(238, 'App\\Models\\User', 1, 'authToken', '9bea0d18f12d153e248c448c41f3fb70ec0ae0c1c4482cba9597bac0c0363e86', '[\"*\"]', '2026-04-12 02:06:06', NULL, '2026-04-12 02:05:51', '2026-04-12 02:06:06'),
(239, 'App\\Models\\User', 1, 'authToken', '0afb3d4648452392d98f087d3d6919e59d463c99d176c8bf149f75d9cc488d07', '[\"*\"]', '2026-04-12 06:59:42', NULL, '2026-04-12 06:59:38', '2026-04-12 06:59:42');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `section_name`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Belly', 1, '2024-06-04 11:35:59', '2024-06-04 11:35:59'),
(2, 'Kodom', 1, '2024-06-04 11:36:09', '2024-06-04 11:36:09'),
(3, 'Togor', 1, '2024-06-04 11:36:22', '2024-06-04 11:36:22'),
(4, 'Joba', 1, '2024-06-04 11:36:36', '2024-06-04 11:36:36'),
(5, 'Shapla', 1, '2024-06-04 11:36:47', '2024-06-04 11:36:47'),
(6, 'Shiuly', 1, '2024-06-04 11:37:14', '2024-06-04 11:37:14'),
(7, 'Shimul', 1, '2024-06-04 11:37:30', '2024-06-04 11:37:30'),
(8, 'Golap', 1, '2024-06-04 11:37:49', '2024-06-04 11:37:49'),
(9, 'Dalia', 1, '2024-06-04 11:38:02', '2024-06-04 11:38:02'),
(10, 'Polash', 1, '2024-06-04 11:38:12', '2024-06-04 11:38:12'),
(11, 'Doyal', 1, '2024-06-04 11:39:07', '2024-06-04 11:39:07'),
(12, 'Moyna', 1, '2024-06-04 11:39:20', '2024-06-04 11:39:20'),
(13, 'Maghna', 1, '2024-06-04 11:39:56', '2024-06-04 11:39:56'),
(14, 'Jamuna', 1, '2024-06-04 11:40:37', '2024-06-04 11:40:37'),
(15, 'Podda', 1, '2024-06-04 11:41:02', '2024-06-04 11:41:02');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `session_name`, `user_id`, `created_at`, `updated_at`) VALUES
(1, '2023-2024', 1, '2024-06-04 15:36:47', '2024-06-04 15:36:47');

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shifts_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shifts`
--

INSERT INTO `shifts` (`id`, `shifts_name`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Morning', 1, '2024-06-04 11:35:27', '2024-06-04 11:35:27'),
(2, 'Day', 1, '2024-06-04 11:35:37', '2024-06-04 11:35:37');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `staff_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `religion` varchar(255) NOT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `present_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `nid` varchar(255) DEFAULT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `sms_status` text DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` varchar(255) NOT NULL,
  `admission_no` varchar(255) DEFAULT NULL,
  `admission_date` date NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `bangla_name` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) NOT NULL,
  `father_nid` varchar(255) DEFAULT NULL,
  `father_mobile` varchar(255) NOT NULL,
  `mother_name` varchar(255) NOT NULL,
  `mother_nid` varchar(255) DEFAULT NULL,
  `mother_mobile` varchar(255) NOT NULL,
  `guardian_name` varchar(255) DEFAULT NULL,
  `guardian_mobile` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `gender` varchar(255) NOT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `religion` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `student_bc` varchar(255) DEFAULT NULL,
  `present_address` text NOT NULL,
  `permanent_address` text NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `sms_status` text NOT NULL,
  `status` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `admission_no`, `admission_date`, `student_name`, `bangla_name`, `father_name`, `father_nid`, `father_mobile`, `mother_name`, `mother_nid`, `mother_mobile`, `guardian_name`, `guardian_mobile`, `dob`, `gender`, `blood_group`, `religion`, `email`, `student_bc`, `present_address`, `permanent_address`, `img_url`, `sms_status`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(1, '101', NULL, '2024-06-04', 'Tousif  Islam  Toha', 'N/A', 'Md.Forhad Hossain', 'N/A', '01740208959', 'Tithi  Akter', 'N/A', '01762102404', NULL, '07162102404', '2019-07-19', 'Male', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1717515945-dummy-man.png', 'active', 'active', 1, '2024-06-04 15:45:45', '2024-06-04 15:45:45'),
(2, '102', NULL, '2024-06-04', 'Ariyan Amin  Ayat', NULL, 'Al-Amin', NULL, '01979141817', 'Rasi amin', NULL, '01979141817', NULL, '01979141817', '2019-11-06', 'Male', NULL, 'Islam', NULL, NULL, 'Dogachi,pabna.', 'Dogachi,pabna.', 'uploads/Student_img/1-1717518489-dummy-man.png', 'active', 'active', 1, '2024-06-04 16:28:09', '2024-06-04 16:28:09'),
(3, '103', NULL, '2024-06-04', 'Meerab jannat', NULL, 'Kamran khan', NULL, '01712562956', 'Lamisa Hasan', NULL, '01782700829', NULL, '01782700829', '2020-08-07', 'Male', NULL, 'Islam', NULL, NULL, 'Mansurabad Residental Area', 'Mansurabad Residental Area', 'uploads/Student_img/1-1717518910-dummy-man.png', 'active', 'active', 1, '2024-06-04 16:35:10', '2024-06-04 16:35:10'),
(4, '104', NULL, '2024-06-04', 'Mst. Ekra Eisha', NULL, 'Md. Masud Rana', NULL, '01308360197', 'Mst . Dola Islam', NULL, '01992823989', NULL, '01992823989', '2020-01-08', 'Female', NULL, 'Islam', NULL, NULL, 'Ashutospur, Pabna', 'Ashutospur, Pabna', 'uploads/Student_img/1-1717520280-Girl.png', 'active', 'active', 1, '2024-06-04 16:58:00', '2024-06-04 16:58:00'),
(17, '117', NULL, '2024-06-05', 'Mst.Raiyaan  Binte Rodela', NULL, 'Md.Rakib Hassan', NULL, '01734168008', 'Mst.Sadia Siddique Mou', NULL, '01305493446', NULL, '01305493446', '2018-07-28', 'Female', NULL, 'Islam', NULL, NULL, 'Ullapara,Sirajgong.', 'Ullapara,Sirajgong.', 'uploads/Student_img/1-1717588832-Girl.png', 'active', 'active', 1, '2024-06-05 12:00:32', '2024-06-05 12:00:32'),
(20, '120', NULL, '2024-06-05', 'Nurain Kashfia', NULL, 'Sardar Md.Kayes', NULL, '01712038752', 'Mst.Sumaya Khatun', NULL, '01795910910', NULL, '01712038752', '2018-03-08', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1717593062-Girl.png', 'active', 'active', 1, '2024-06-05 13:11:02', '2024-06-05 13:11:02'),
(21, '121', NULL, '2024-06-05', 'Nabila Jahan Noha', NULL, 'Md.Nazer  Ali', NULL, '01716953108', 'Mst. Rina Akter', NULL, '01749232966', NULL, '01716953108', '2017-11-07', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Bagmara.Jamalpur.', 'uploads/Student_img/1-1717593445-Girl.png', 'active', 'active', 1, '2024-06-05 13:17:25', '2024-06-05 13:17:25'),
(30, '130', NULL, '2024-06-05', 'Zarin tasnim zeba', NULL, 'Md. Jahangir Alam', NULL, '01719080862', 'Kamrunnahar', NULL, '01755985677', NULL, '01755985677', '2018-10-12', 'Female', NULL, 'Islam', NULL, NULL, 'Gobindopur', 'Gobindopur', 'uploads/Student_img/1-1717597874-Girl.png', 'active', 'active', 1, '2024-06-05 14:31:14', '2024-06-05 14:31:14'),
(37, '137', NULL, '2024-06-05', 'Zahra Farzeen', NULL, 'Md. Abul Faisal', NULL, '01930506676', 'Fahima Sultana', NULL, '01729987290', NULL, '01729987290', '2019-07-31', 'Female', NULL, 'Islam', NULL, NULL, 'South Ramchandrapur ,Pabna', 'South Ramchandrapur ,Pabna', 'uploads/Student_img/1-1717602326-Girl.png', 'active', 'active', 1, '2024-06-05 15:45:26', '2024-06-05 15:45:26'),
(40, '140', NULL, '2024-06-05', 'MD. Saymon Hossan', NULL, 'MD. Nazmul Hassan', NULL, '01711410068', 'MST.  Sompa Khatun', NULL, '01611410068', NULL, '01750205566', '2024-06-05', 'Male', NULL, 'Islam', NULL, NULL, 'Ramchandopur', 'Ramchandopur', 'uploads/Student_img/1-1717603428-Boy.png', 'active', 'active', 1, '2024-06-05 16:03:48', '2024-06-05 16:03:48'),
(41, '141', NULL, '2024-06-05', 'Tasnim Al Fuad', NULL, 'Abu Seyem', NULL, '01713568235', 'Tasbiha Aktar', NULL, '01688251033', NULL, '01688251033', '2018-07-05', 'Male', NULL, 'Islam', NULL, NULL, 'Ramchandropur , Pabna', 'Ramchandropur , Pabna', 'uploads/Student_img/1-1717603851-Boy.png', 'active', 'active', 1, '2024-06-05 16:10:51', '2024-06-05 16:10:51'),
(44, '144', NULL, '2024-06-05', 'Nusrat Jahan', NULL, 'Faruk Mollik', NULL, '01917458143', 'Nasima Mollik', NULL, '01313607157', NULL, '01917458143', '2018-01-01', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur ,Pabna', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717605298-Girl.png', 'active', 'active', 1, '2024-06-05 16:34:58', '2024-06-05 16:34:58'),
(45, '145', NULL, '2024-06-05', 'Most. Adiba Anam', NULL, 'MD. Aprahim', NULL, '01756268936', 'Most. Fatima Khatun', NULL, '01888356706', NULL, '01756268936', '2019-05-14', 'Female', NULL, 'Islam', NULL, NULL, 'Mujahid club , Pabna', 'Mujahid club , Pabna', 'uploads/Student_img/1-1717605618-Girl.png', 'active', 'active', 1, '2024-06-05 16:40:18', '2024-06-05 16:40:18'),
(48, '148', NULL, '2024-06-05', 'MD. Galibul Islam', NULL, 'MD. Bappy Hasan', NULL, '01766987914', 'MST. Sultana Khatun', NULL, '01739516879', NULL, '01739516879', '2020-05-12', 'Male', NULL, 'Islam', NULL, NULL, 'Nazirpur Hatpara', 'Nazirpur Hatpara', 'uploads/Student_img/1-1717606627-Boy.png', 'active', 'active', 1, '2024-06-05 16:57:07', '2024-06-05 16:57:07'),
(49, '149', NULL, '2024-06-05', 'Mabruka Ibnat Fatema', NULL, 'MD. Abdul Halim', NULL, '01717450846', 'Shanjida Aktar', NULL, '01912262320', NULL, '01912262320', '2019-02-11', 'Female', NULL, 'Islam', NULL, NULL, 'Betepara , Pabna', 'Betepara , Pabna', 'uploads/Student_img/1-1717606998-Girl.png', 'active', 'active', 1, '2024-06-05 17:03:18', '2024-06-05 17:03:18'),
(50, '150', NULL, '2024-06-05', 'Fatema', NULL, 'Hasan Islam', NULL, '01724392215', 'Runa', NULL, '01306234277', NULL, '01306234277', '2017-06-02', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur ,Pabna', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717607138-Girl.png', 'active', 'active', 1, '2024-06-05 17:05:38', '2024-06-05 17:05:38'),
(51, '151', NULL, '2024-06-05', 'Ayesha  Armin zara', NULL, 'MD. Alamgir', NULL, '01743422257', 'sharmin Akter', NULL, '01709014573', NULL, '01709014573', '2017-08-23', 'Female', NULL, 'Islam', NULL, NULL, 'Dhanuaghata, Pabna', 'Dhanuaghata, Pabna', 'uploads/Student_img/1-1717607464-Girl.png', 'active', 'active', 1, '2024-06-05 17:11:04', '2024-06-05 17:11:04'),
(52, '152', NULL, '2024-06-05', 'Taheera  Ferdous   Aareebah', NULL, 'Taha Md. Abdullah', NULL, '01716146530', 'Dr. Jannatul  Ferdous  Baishakhi', NULL, '01728165455', NULL, '01728165455', '2020-01-19', 'Female', NULL, 'Islam', NULL, NULL, 'Goyeshpur,pabna.', 'jotgoury,jalalpur,pabna.', 'uploads/Student_img/1-1717608046-Girl.png', 'active', 'active', 1, '2024-06-05 17:20:46', '2024-06-05 17:20:46'),
(53, '153', NULL, '2024-06-05', 'Mohsina  Haque  Biva', NULL, 'Md.Amdadul Haque', NULL, '01724951144', 'Mst.Mariom  Begum', NULL, '01777735637308', NULL, '01724951144', '2018-09-08', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,pabna.', 'Sujanogor, pabna.', 'uploads/Student_img/1-1717608353-Girl.png', 'active', 'active', 1, '2024-06-05 17:25:53', '2024-06-05 17:25:53'),
(54, '154', NULL, '2024-06-05', 'Mahjabin  Haque Prova', NULL, 'Md.Amdadul  Haque', NULL, '01724951144', 'Mst.Moriom Begum', NULL, '01735637308', NULL, '01724951144', '2018-09-08', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur ,Pabna', 'Sujanogor,pabna.', 'uploads/Student_img/1-1717609441-Girl.png', 'active', 'active', 1, '2024-06-05 17:44:01', '2024-06-05 17:44:01'),
(55, '155', NULL, '2024-06-05', 'Samiha  Akter  Hriti', NULL, 'Md. Bachhu  Pramanik', NULL, '01715507498', 'Mst. Sathi  Khatun', NULL, '01745739098', NULL, '01745739098', '2017-07-30', 'Female', NULL, 'Islam', NULL, NULL, 'Bangla Bazar,Pabna.', 'Bangla Bazar,Pabna.', 'uploads/Student_img/1-1717609817-Girl.png', 'active', 'active', 1, '2024-06-05 17:50:17', '2024-06-05 17:50:17'),
(56, '156', NULL, '2024-06-05', 'Arshiya  Umaiza  mawa', NULL, 'Md.Razaul  Karim Moni', NULL, '01720434567', 'Mst.Ratna Khatun', NULL, '01738941210', NULL, '01738941210', '2019-11-14', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandrapur,Pabna.', 'South  Ramchandrapur,Pabna.', 'uploads/Student_img/1-1717610197-Girl.png', 'active', 'active', 1, '2024-06-05 17:56:37', '2024-06-05 17:56:37'),
(57, '157', NULL, '2024-06-05', 'Shammi  Akter  Roza', NULL, 'Shakil  Sheikh', NULL, '01799841961', 'Mou  Khatun', NULL, '01766181054', NULL, '01799841961', '2017-06-12', 'Female', NULL, 'Islam', NULL, NULL, 'Doherpara,Pabna.', 'Doherpara,Pabna.', 'uploads/Student_img/1-1717610488-Girl.png', 'active', 'active', 1, '2024-06-05 18:01:28', '2024-06-05 18:01:28'),
(58, '158', NULL, '2024-06-05', 'Srikanto  Kumar  Saha', NULL, 'Sree  Sumon  Kumar  Saha', NULL, '01728987827', 'Tumpa  Das', NULL, '01728987827', NULL, '01728987827', '2017-12-01', 'Male', NULL, 'Hindu', NULL, NULL, 'Ramchandrapur,Pabna.', 'Ramchandrapur,Pabna.', 'uploads/Student_img/1-1717610759-Boy.png', 'active', 'active', 1, '2024-06-05 18:05:59', '2024-06-05 18:05:59'),
(59, '159', NULL, '2024-06-05', 'Md.Galib Ullah', NULL, 'Md. Zehad Hossain', NULL, '01753226080', 'Misila  Akter', NULL, '01762662267', NULL, '01762662267', '2020-04-05', 'Male', NULL, 'Islam', NULL, NULL, 'South Atua, Pabna.', 'South Atua, Pabna.', 'uploads/Student_img/1-1717611038-Boy.png', 'active', 'active', 1, '2024-06-05 18:10:38', '2024-06-05 18:10:38'),
(60, '160', NULL, '2024-06-05', 'Abu Talha', NULL, 'Md. Shentu', NULL, '01972269883', 'Ismotra', NULL, '01401304069', NULL, '01401304069', '2018-04-17', 'Male', NULL, 'Islam', NULL, NULL, 'South  Ragbpur,pabna.', 'KumerKhali,Kushtia.', 'uploads/Student_img/1-1717611342-Boy.png', 'active', 'active', 1, '2024-06-05 18:15:42', '2024-06-05 18:15:42'),
(61, '161', NULL, '2024-06-05', 'Jannatul  Mawa  Saba', NULL, 'Md. Sasel  Islam', NULL, '01792183081', 'Mst.Bristi Khatun', NULL, '01842891098', NULL, '01792183081', '2019-11-07', 'Female', NULL, 'Islam', NULL, NULL, 'Maligacha,Pabna.', 'Maligacha,Pabna.', 'uploads/Student_img/1-1717611653-Girl.png', 'active', 'active', 1, '2024-06-05 18:20:53', '2024-06-05 18:20:53'),
(62, '162', NULL, '2024-06-05', 'Mst. Sumaiya  Islam', NULL, 'Md. Faruk', NULL, '01789416000', 'Mst. Shamoli Akter', NULL, '01831881135', NULL, '01789416000', '2017-09-03', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur ,Pabna', 'Kaharole, Dinajpur.', 'uploads/Student_img/1-1717611950-Girl.png', 'active', 'active', 1, '2024-06-05 18:25:50', '2024-06-05 18:25:50'),
(63, '163', NULL, '2024-06-05', 'Tamjid', NULL, 'Jakaria  Islam  Shovon', NULL, '01712869500', 'Taslima  Khatun', NULL, '01767909593', NULL, '01733275113', '2019-10-15', 'Male', NULL, 'Islam', NULL, NULL, 'Ghoshpara,Pabna.', 'Ghoshpara,Pabna.', 'uploads/Student_img/1-1717612208-Boy.png', 'active', 'active', 1, '2024-06-05 18:30:08', '2024-06-05 18:30:08'),
(64, '164', NULL, '2024-06-05', 'Fatema  Khatun', NULL, 'Md.Quyem Pramanik', NULL, '01740845393', 'Sharmin', NULL, '01759821313', NULL, '01740845393', '2019-11-08', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandrapur,Pabna.', 'South  Ramchandrapur,Pabna.', 'uploads/Student_img/1-1717612571-Girl.png', 'active', 'active', 1, '2024-06-05 18:36:11', '2024-06-05 18:36:11'),
(65, '165', NULL, '2024-06-05', 'Mst.Mariam  Khatun', NULL, 'Md.Quyem Pramanik', NULL, '01740845393', 'Sharmin', NULL, '01759821313', NULL, '01759821313', '2024-06-05', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandrapur,Pabna.', 'South  Ramchandrapur,Pabna.', 'uploads/Student_img/1-1717613052-Girl.png', 'active', 'active', 1, '2024-06-05 18:44:12', '2024-06-05 18:44:12'),
(66, '166', NULL, '2024-06-05', 'Md.Rahil  Bishwas', NULL, 'Md. Rayhan  Bishwas', NULL, '01738068427', 'Farzana  Naznin', NULL, '01731096116', NULL, '01731096116', '2019-04-25', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717613284-Boy.png', 'active', 'active', 1, '2024-06-05 18:48:04', '2024-06-05 18:48:04'),
(67, '167', NULL, '2024-06-05', 'Md.Rahil  Bishwas', NULL, 'Md. Rayhan  Bishwas', NULL, '01738068427', 'Farzana  Naznin', NULL, '01731096116', NULL, '01731096116', '2019-04-25', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717613317-Boy.png', 'active', 'active', 1, '2024-06-05 18:48:37', '2024-06-05 18:48:37'),
(68, '168', NULL, '2024-06-06', 'Ahsanul  Khan  Sadib', NULL, 'Md. Helal  Khan', NULL, '01737250303', 'Mst.Urmin Khatun', NULL, '01771592595', NULL, '01737250303', '2020-10-03', 'Male', NULL, 'Islam', NULL, NULL, 'Shadhupara,Pabna.', 'Shadhupara,Pabna.', 'uploads/Student_img/1-1717669109-Boy.png', 'active', 'active', 1, '2024-06-06 10:18:29', '2024-06-06 10:18:29'),
(69, '169', NULL, '2024-06-06', 'Abrir  Hasan', NULL, 'Abid Hasan', NULL, '01762609303', 'Salina Khatun', NULL, '01724731708', NULL, '01762609303', '2019-02-22', 'Male', NULL, 'Islam', NULL, NULL, 'South Ragobpur,Pabna', 'South Ragobpur,Pabna', 'uploads/Student_img/1-1717670565-Boy.png', 'active', 'active', 1, '2024-06-06 10:42:45', '2024-06-06 10:42:45'),
(70, '170', NULL, '2023-06-06', 'Imama khatun', NULL, 'MD. Imran Hossain', NULL, '01712554829', 'Al Asma  ul Hosna  Asha', NULL, '01742326839', NULL, '01742326839', '2024-06-06', 'Male', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna', 'Kacharipara,Pabna', 'uploads/Student_img/1-1717673028-Boy.png', 'active', 'active', 1, '2024-06-06 11:23:48', '2024-06-06 11:23:48'),
(71, '171', NULL, '2024-06-06', 'MstUmme Ayman Orin', NULL, 'Md.Mahbubul Alam', NULL, '01719477101', 'Mst. Shilpi Akter', NULL, '01755157920', NULL, '01719477101', '2018-01-08', 'Male', NULL, 'Islam', NULL, NULL, 'South  Raghobpur,Pabna.', 'Sadullapur,Gaibandha.', 'uploads/Student_img/1-1717673477-Girl.png', 'active', 'active', 1, '2024-06-06 11:31:17', '2024-06-06 11:31:17'),
(72, '172', NULL, '2024-06-06', 'Nuri  hafa  Riti', NULL, 'Md.Rashed Ali Shak', NULL, '01712281094', 'Mst.Nasima Khatun', NULL, '01752312405', NULL, '01712281094', '2018-05-13', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1717673782-Girl.png', 'active', 'active', 1, '2024-06-06 11:36:22', '2024-06-06 11:36:22'),
(74, '174', NULL, '2024-06-06', 'Shams Tasmeen  Naba', NULL, 'Md. Shamim  Hossion', NULL, '01737917511', 'Tahasina  Tithi', NULL, '01761059412', NULL, '01747564313', '2019-10-02', 'Female', NULL, 'Islam', NULL, NULL, 'Pathorrola,Pabna.', 'Char  Asutuspur,Pabna.', 'uploads/Student_img/1-1717674146-Girl.png', 'active', 'active', 1, '2024-06-06 11:42:26', '2024-06-06 11:42:26'),
(75, '175', NULL, '2024-06-06', 'P.M. Sadaquat Shahir', NULL, 'P.M. Shahadat  Hossain', NULL, '01553420098', 'Kaniz  Fatema Setu', NULL, '01552746302', NULL, '01552746302', '2018-02-12', 'Male', NULL, 'Islam', NULL, NULL, 'Station,Raghobpur,Pabna.', 'Ishwardi,Pabna.', 'uploads/Student_img/1-1717674506-Boy.png', 'active', 'active', 1, '2024-06-06 11:48:26', '2024-06-06 11:48:26'),
(76, '176', NULL, '2024-06-06', 'Aysha  Khan', NULL, 'Md.Amir Hossain opu', NULL, '01703910435', 'Shapla  Akter', NULL, '01733006975', NULL, '01754120026', '2018-07-01', 'Male', NULL, 'Islam', NULL, NULL, 'Mokondopur,Pabna.', 'Mokondopur,Pabna.', 'uploads/Student_img/1-1717674879-Boy.png', 'active', 'active', 1, '2024-06-06 11:54:39', '2024-06-06 11:54:39'),
(77, '177', NULL, '2024-06-06', 'Roza  Islam  Raisa', NULL, 'Md.Merajul  Islam', NULL, '01781342206', 'Mst.Shetu  Khatun', NULL, '01763970849', NULL, '01781342206', '2017-04-16', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1717675089-Girl.png', 'active', 'active', 1, '2024-06-06 11:58:09', '2024-06-06 11:58:09'),
(78, '178', NULL, '2024-06-06', 'Avro  Sutrodhar', NULL, 'Apurbo Sutrodhar', NULL, '01715386046', 'Manashi  Bala', NULL, '01729339417', NULL, '01715386046', '2019-04-10', 'Male', NULL, 'Hindu', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1717675367-Boy.png', 'active', 'active', 1, '2024-06-06 12:02:47', '2024-06-06 12:02:47'),
(79, '179', NULL, '2024-06-06', 'Shafi  Al Naz  Ranan', NULL, 'Md. Nazmul  Alam', NULL, '01720221222', 'Arifa  Sultana', NULL, '01793692023', NULL, '01793692023', '2018-10-31', 'Male', NULL, 'Islam', NULL, NULL, 'Moksedpur,Pabna.', 'Moksedpur,Pabna.', 'uploads/Student_img/1-1717675584-Boy.png', 'active', 'active', 1, '2024-06-06 12:06:24', '2024-06-06 12:06:24'),
(80, '180', NULL, '2024-06-06', 'Saimon  Islam', NULL, 'Md. Shaidul  Islam', NULL, '01744406847', 'Rupa  Islam', NULL, '01720906989', NULL, '01744406847', '2019-12-29', 'Male', NULL, 'Islam', NULL, NULL, 'Pabna', 'Pabna', 'uploads/Student_img/1-1717676607-Boy.png', 'active', 'active', 1, '2024-06-06 12:23:27', '2024-06-06 12:23:27'),
(81, '181', NULL, '2024-06-06', 'Faysal  Ahmed', NULL, 'Md.Rabbe  Abedin  jebon', NULL, '01581198277', 'Koly  Akter', NULL, '01763464046', NULL, '01581198277', '2019-07-23', 'Male', NULL, 'Islam', NULL, NULL, 'Bangla Bazar,Pabna.', 'Bangla Bazar,Pabna.', 'uploads/Student_img/1-1717676840-Boy.png', 'active', 'active', 1, '2024-06-06 12:27:20', '2024-06-06 12:27:20'),
(82, '182', NULL, '2024-06-06', 'Bushra  Jabin  Bokul', NULL, 'Md.Bokul  Hossen', NULL, '01722721429', 'Mst. Jannatul  Fardous  Soma', NULL, '01781069450', NULL, '01722721429', '2020-04-25', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Taras, sirajgong.', 'uploads/Student_img/1-1717677169-Girl.png', 'active', 'active', 1, '2024-06-06 12:32:49', '2024-06-06 12:32:49'),
(83, '183', NULL, '2024-06-06', 'Jarin  Tasnim  Jara', NULL, 'Md. Saddam  Hossain', NULL, '01722361935', 'Khadiza Akter', NULL, '01704587179', NULL, '01704587179', '2019-08-20', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1717677383-Girl.png', 'active', 'active', 1, '2024-06-06 12:36:23', '2024-06-06 12:36:23'),
(84, '184', NULL, '2024-06-06', 'Md.Sahaduzzaman', NULL, 'Md.Moniruzzaman', NULL, '01828178120', 'Mst.Shama  Akhter', NULL, '01763022174', NULL, '01828178120', '2020-07-19', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717677618-Boy.png', 'active', 'active', 1, '2024-06-06 12:40:18', '2024-06-06 12:40:18'),
(85, '185', NULL, '2024-06-06', 'Maroya Islam', NULL, 'Momin Ali', NULL, '01767712569', 'shelly  Khatun', NULL, '01750764675', NULL, '01750764675', '2021-02-10', 'Female', NULL, 'Islam', NULL, NULL, 'Auta.Pabna.', 'Auta.Pabna.', 'uploads/Student_img/1-1717682108-Girl.png', 'active', 'active', 1, '2024-06-06 13:55:08', '2024-06-06 13:55:08'),
(86, '186', NULL, '2024-06-06', 'Mariyam  Akter', NULL, 'Momin  Topy', NULL, '01767712569', 'Shelly  Khatun', NULL, '01750764675', NULL, '01750764675', '2018-11-03', 'Female', NULL, 'Islam', NULL, NULL, 'Atua,Pabna.', 'Atua,Pabna.', 'uploads/Student_img/1-1717682375-Girl.png', 'active', 'active', 1, '2024-06-06 13:59:35', '2024-06-06 13:59:35'),
(87, '187', NULL, '2024-06-06', 'ALI HASAN', NULL, 'MD.SHAINU RAHMANN', NULL, '0172851049', 'MST. HASI KHATUN', NULL, '01721618411', NULL, '01721618411', '2016-10-02', 'Male', NULL, 'Islam', NULL, NULL, 'HAJIHAT,PABNA', 'HAJIHAT,PABNA', 'uploads/Student_img/1-1717687291-Boy.png', 'active', 'active', 1, '2024-06-06 15:21:31', '2024-06-06 15:21:31'),
(88, '188', NULL, '2024-06-06', 'SAIYARA NAZEEFA', NULL, 'MD.SHOYOAN HOSSAIN', NULL, '01748789287', 'FARJANA SULTANA', NULL, '01771032140', NULL, '01748789287', '2019-01-26', 'Female', NULL, 'Islam', NULL, NULL, 'MOHISHER DIPO', 'HAJIHAT,PABNA', 'uploads/Student_img/1-1717687762-Girl.png', 'active', 'active', 1, '2024-06-06 15:29:22', '2024-06-06 15:29:22'),
(91, '191', NULL, '2024-06-06', 'JANNATUL MAWA', NULL, 'MD. ABDULLA AL MAMUN', NULL, '01721800641', 'MST.SUBORNA KHATUN', NULL, '01761537381', NULL, '01761537381', '2021-04-20', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR , GHOSPARA ,PABNA', 'RAMCHANDRAPUR , GHOSPARA ,PABNA', 'uploads/Student_img/1-1717689261-Girl.png', 'active', 'active', 1, '2024-06-06 15:54:21', '2024-06-06 15:54:21'),
(98, '198', NULL, '2024-06-06', 'MD. TUSHER', NULL, 'MILTON', NULL, '01763762351', 'MST . SHILA KHATUN', NULL, '01731294164', NULL, '01731294164', '2019-04-06', 'Male', NULL, 'Islam', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1717691849-Boy.png', 'active', 'active', 1, '2024-06-06 16:37:29', '2024-06-06 16:37:29'),
(99, '199', NULL, '2024-06-06', 'RIDDHIMAN DAS', NULL, 'DIPONKUR DAS', NULL, '01716435749', 'SRABONI RANI DAS', NULL, '01723794494', NULL, '01723794494', '2020-10-10', 'Male', NULL, 'Islam', NULL, NULL, 'SHALGARIA,PABNA', 'SHALGARIA,PABNA', 'uploads/Student_img/1-1717692225-Boy.png', 'active', 'active', 1, '2024-06-06 16:43:45', '2024-06-06 16:43:45'),
(100, '200', NULL, '2024-06-06', 'FAYAZ BIN SAMIR', NULL, 'MD. MURSHED', NULL, '01779923403', 'MST. SARMIN AKTER', NULL, '01756686826', NULL, '01779923403', '2021-03-27', 'Male', NULL, 'Islam', NULL, NULL, 'DIPCHOR, PABNA', 'DIPCHOR, PABNA', 'uploads/Student_img/1-1717692494-Boy.png', 'active', 'active', 1, '2024-06-06 16:48:14', '2024-06-06 16:48:14'),
(101, '201', NULL, '2024-06-06', 'MASHFIA HOSSAIN RAIKA', NULL, 'MILON', NULL, '01711714607', 'DR, NUSRAT JAHAN LINA', NULL, '01753378688', NULL, '01753378688', '2019-08-10', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHONDROPUR, PABNA', 'RAMCHONDROPUR, PABNA', 'uploads/Student_img/1-1717692888-Girl.png', 'active', 'active', 1, '2024-06-06 16:54:48', '2024-06-06 16:54:48'),
(102, '202', NULL, '2024-06-06', 'HUMAYRA PARVIN', NULL, 'MD. MOTAHARUL ISLAM', NULL, '01770082056', 'FATEMA AKTER', NULL, '0188690069', NULL, '01770082056', '2019-12-25', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGOBPUR , PABNA', 'SOUTH RAGOBPUR , PABNA', 'uploads/Student_img/1-1717693158-Girl.png', 'active', 'active', 1, '2024-06-06 16:59:18', '2024-06-06 16:59:18'),
(103, '203', NULL, '2024-06-06', 'TONUSREE BROMOCHARY', NULL, 'AVIJIT BROMOCHARY', NULL, '01721037535', 'TOMALIEKA BROMOCHARY', NULL, '01740812606', NULL, '01740812606', '2020-07-02', 'Male', NULL, 'SONATON', NULL, NULL, 'SOUTH RAGOBPUR', 'SOUTH RAGOBPUR', 'uploads/Student_img/1-1717693673-Girl.png', 'active', 'active', 1, '2024-06-06 17:07:53', '2024-06-06 17:07:53'),
(104, '204', NULL, '2024-06-06', 'ABRAR IBNUR SADIT', NULL, 'SHAIDUL ISLAM', NULL, '01757991423', 'BILKIS KHATUN', NULL, '01748471182', NULL, '01757991423', '2018-08-02', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGOBPUR PABNA', 'SOUTH RAGOBPUR PABNA', 'uploads/Student_img/1-1717693933-Boy.png', 'active', 'active', 1, '2024-06-06 17:12:13', '2024-06-06 17:12:13'),
(105, '205', NULL, '2024-06-06', 'RIDWAN ROBBANI ADIB', NULL, 'MD. RIFAT HOSSAIN', NULL, '01701476162', 'MOST. UMAIYA KHANOME OMI', NULL, '01709012049', NULL, '01709012049', '2018-09-01', 'Male', NULL, 'Islam', NULL, NULL, 'BOLORAMPUR ,PABNA', 'BOLORAMPUR ,PABNA', 'uploads/Student_img/1-1717694287-Boy.png', 'active', 'active', 1, '2024-06-06 17:18:07', '2024-06-06 17:18:07'),
(106, '206', NULL, '2024-06-06', 'Md. Nibir Khan', NULL, 'Md. Robiul  Islam', NULL, '01749386099', 'Mst.Nupur Khatun', NULL, '01742191866', NULL, '07142191866', '2019-11-11', 'Male', NULL, 'Islam', NULL, NULL, 'Charashutuspur, Pabna.', 'Charashutuspur, Pabna.', 'uploads/Student_img/1-1717694861-Boy.png', 'active', 'active', 1, '2024-06-06 17:27:41', '2024-06-06 17:27:41'),
(107, '207', NULL, '2024-06-06', 'Saif Adana  Labib', NULL, 'Md.Sirajul  Islam', NULL, '01722075257', 'Runa  Khatun', NULL, '01744353528', NULL, '01722075257', '2018-08-06', 'Male', NULL, 'Islam', NULL, NULL, 'Charashutuspur, Pabna.', 'Charashutuspur, Pabna.', 'uploads/Student_img/1-1717695123-Boy.png', 'active', 'active', 1, '2024-06-06 17:32:03', '2024-06-06 17:32:03'),
(108, '208', NULL, '2024-06-06', 'Ibadot  Islam Yeafi', NULL, 'Md.Yeasin  Shekh', NULL, '01324583859', 'Mst.Onamika  Akter', NULL, '01324583859', NULL, '01324583859', '2019-04-14', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1717695381-Boy.png', 'active', 'active', 1, '2024-06-06 17:36:21', '2024-06-06 17:36:21'),
(109, '209', NULL, '2024-06-06', 'Md.Ayman Anjum Khan', NULL, 'Md.Rabiul Islam', NULL, '01712656474', 'Amena Akter', NULL, '01850706062', NULL, '01850706062', '2019-04-11', 'Male', NULL, 'Islam', NULL, NULL, 'Salgaria,Pabna.', 'Salgaria,Pabna.', 'uploads/Student_img/1-1717695690-Boy.png', 'active', 'active', 1, '2024-06-06 17:41:30', '2024-06-06 17:41:30'),
(110, '210', NULL, '2024-06-06', 'Sarfaraj  Khan  Turjo', NULL, 'Md.Abdul Kader  Tushar', NULL, '01711172357', 'Farhana  Akter  Bristy', NULL, '01728545679', NULL, '01728545679', '2017-03-11', 'Male', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1717695951-Boy.png', 'active', 'active', 1, '2024-06-06 17:45:51', '2024-06-06 17:45:51'),
(111, '211', NULL, '2024-06-06', 'Ayesha Siddika  toyo', NULL, 'Asaduzzaman Asad', NULL, '01761588536', 'Shirina  Khatun', NULL, '01310845474', NULL, '01712795216', '2018-11-24', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchar  Ramchandropur,Pabna.', 'Dipchar  Ramchandropur,Pabna.', 'uploads/Student_img/1-1717696219-Girl.png', 'active', 'active', 1, '2024-06-06 17:50:19', '2024-06-06 17:50:19'),
(112, '212', NULL, '2024-06-06', 'Faiyaz  Islam Ayan', NULL, 'Md.Rakibul  Islam', NULL, '01747096484', 'Shamima  Akter', NULL, '01780451197', NULL, '01780451297', '2020-02-02', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1717696583-Boy.png', 'active', 'active', 1, '2024-06-06 17:56:23', '2024-06-06 17:56:23'),
(113, '213', NULL, '2024-06-06', 'Shopnil  Dus  Rudro', NULL, 'Sajib Kumar Dus', NULL, '01737917508', 'Sampa Rani Sarkar', NULL, '01755160549', NULL, '01737917508', '2020-01-01', 'Male', NULL, 'Hindu', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717696855-Boy.png', 'active', 'active', 1, '2024-06-06 18:00:55', '2024-06-06 18:00:55'),
(114, '214', NULL, '2024-06-06', 'Abdullah  Rayek', NULL, 'Md.Moklesur  Rahman', NULL, '01721340335', 'Rokeya  Khatun', NULL, '01717854636', NULL, '01721340335', '2024-06-06', 'Male', NULL, 'Islam', NULL, NULL, 'South  Raghobpur,Pabna.', 'South  Raghobpur,Pabna.', 'uploads/Student_img/1-1717697089-Boy.png', 'active', 'active', 1, '2024-06-06 18:04:49', '2024-06-06 18:04:49'),
(115, '215', NULL, '2024-06-06', 'Adian  Ibrahim  Sami', NULL, 'Karamot  Ali', NULL, '01715122666', 'Aivin  Akter', NULL, '01714889057', NULL, '01715122666', '2018-03-27', 'Male', NULL, 'Islam', NULL, NULL, 'Anonto Bazar,Pabna.', 'Anonto Bazar,Pabna.', 'uploads/Student_img/1-1717697354-Boy.png', 'active', 'active', 1, '2024-06-06 18:09:14', '2024-06-06 18:09:14'),
(116, '216', NULL, '2024-06-06', 'Tasnim  Talukder', NULL, 'Md.Anisur  Rahman', NULL, '01704124375', 'Rina  Nasrin', NULL, '01735478424', NULL, '01735478424', '2019-07-14', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717697579-Boy.png', 'active', 'active', 1, '2024-06-06 18:12:59', '2024-06-06 18:12:59'),
(117, '217', NULL, '2024-06-06', 'Mehjabin', NULL, 'Md.Manik  Hossain', NULL, '01757017502', 'Sayma  Sultana', NULL, '01724815062', NULL, '01757017502', '2018-01-01', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'Tebunia,Pabna.', 'uploads/Student_img/1-1717697845-Girl.png', 'active', 'active', 1, '2024-06-06 18:17:25', '2024-06-06 18:17:25'),
(118, '218', NULL, '2024-06-06', 'Jaifa Tasnim', NULL, 'Shariful  Islam', NULL, '01706678750', 'Rukaia  Islam', NULL, '01786817064', NULL, '01786817064', '2020-08-22', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Kasinathpur,Pabna.', 'uploads/Student_img/1-1717698068-Girl.png', 'active', 'active', 1, '2024-06-06 18:21:08', '2024-06-06 18:21:08'),
(119, '219', NULL, '2024-06-06', 'Trijoy  Basak', NULL, 'Tonmoy  Basak', NULL, '01711335208', 'Alpona Basak', NULL, '01734938948', NULL, '01711335208', '2018-11-01', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717698296-Boy.png', 'active', 'active', 1, '2024-06-06 18:24:56', '2024-06-06 18:24:56'),
(120, '220', NULL, '2024-06-06', 'Onik Sarker', NULL, 'Joyonto  Kumar  Sarker', NULL, '01724683606', 'Kumari Sabi  Rani', NULL, '01763108166', NULL, '01763108166', '2017-04-29', 'Male', NULL, 'Hindu', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717698479-Boy.png', 'active', 'active', 1, '2024-06-06 18:27:59', '2024-06-06 18:27:59'),
(121, '221', NULL, '2024-06-08', 'ASFIER RAHAMAN', NULL, 'ATIAR RAHAMAN', NULL, '01881832407', 'SHADIA MEHERIN', NULL, '0174073495', NULL, '01740732495', '2018-11-22', 'Male', NULL, 'ISLAM', NULL, NULL, 'RAGOBPUR ,PABNA', 'RAGOBPUR ,PABNA', 'uploads/Student_img/1-1717879538-2422548.png', 'active', 'active', 1, '2024-06-08 20:45:38', '2024-06-08 20:45:38'),
(122, '222', NULL, '2024-06-08', 'MALIHA BUSRA', NULL, 'BIDDUT HOSSIAN', NULL, '01737812926', 'SURMA  KHATUN', NULL, '01307416691', NULL, '01737812926', '2018-09-12', 'Female', NULL, 'ISLAM', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1717879857-2825253.png', 'active', 'active', 1, '2024-06-08 20:50:57', '2024-06-08 20:50:57'),
(123, '223', NULL, '2024-06-08', 'LUBNA KHANAM', NULL, 'MD.ZAHID KHAN', NULL, '01912050553', 'SHAIMULY PARVIN', NULL, '01746759271', NULL, '01746739271', '2019-01-25', 'Female', NULL, 'ISLAM', NULL, NULL, 'RADHANOGOR, PABNA', 'RADHANOGOR, PABNA', 'uploads/Student_img/1-1717880136-2825253.png', 'active', 'active', 1, '2024-06-08 20:55:36', '2024-06-08 20:55:36'),
(124, '224', NULL, '2024-06-08', 'ALTAHA RAIYAN', NULL, 'MD. NAHID HASAN', NULL, '01724997038', 'SABINA RAHMAN', NULL, '01734345282', NULL, '01734345282', '2020-01-05', 'Male', NULL, 'ISLAM', NULL, NULL, 'PURATON TECNICAL ,PABNA', 'PURATON TECNICAL ,PABNA', 'uploads/Student_img/1-1717880422-2422548.png', 'active', 'active', 1, '2024-06-08 21:00:22', '2024-06-08 21:00:22'),
(125, '225', NULL, '2024-06-08', 'FARIHA MEHZABIN', NULL, 'MD.FAKHRUL ISLAM', NULL, 'N/A', 'MST.MINA KHATUN', NULL, '01537700683', NULL, '01537700683', '2018-06-01', 'Female', NULL, 'ISLAM', NULL, NULL, 'BOLORAMPUR, PABNA', 'BOLORAMPUR, PABNA', 'uploads/Student_img/1-1717880781-2825253.png', 'active', 'active', 1, '2024-06-08 21:06:21', '2024-06-08 21:06:21'),
(126, '226', NULL, '2024-06-08', 'FARIHA MEHZABIN', NULL, 'MD.FAKHRUL ISLAM', NULL, 'N/A', 'MST.MINA KHATUN', NULL, '01537700683', NULL, '01537700683', '2018-06-01', 'Female', NULL, 'ISLAM', NULL, NULL, 'BOLORAMPUR, PABNA', 'BOLORAMPUR, PABNA', 'uploads/Student_img/1-1717880901-2825253.png', 'active', 'active', 1, '2024-06-08 21:08:21', '2024-06-08 21:08:21'),
(127, '227', NULL, '2024-06-08', 'TOHMID ABRAR AYAN', NULL, 'MD.SHARIFUL ISLAM', NULL, '01783512487', 'TOUHIDA JANNAT KONIKA', NULL, '01798176025', NULL, '01798176025', '2020-05-09', 'Male', NULL, 'ISLAM', NULL, NULL, 'DOKHAN RAMCHANDPUR,BANGLA BAZAR', 'DOKHAN RAMCHANDPUR,BANGLA BAZAR', 'uploads/Student_img/1-1717881371-2422548.png', 'active', 'active', 1, '2024-06-08 21:16:11', '2024-06-08 21:16:11'),
(128, '228', NULL, '2024-06-08', 'MD. AHANAF ADIL', NULL, 'MD. ANISUL HAQUE', NULL, '01706635063', 'MST.SEKHA KHATUN', NULL, '01783986421', NULL, '01783986421', '2019-06-28', 'Male', NULL, 'ISLAM', NULL, NULL, 'KOMORPUR,PABNA', 'KOMORPUR,PABNA', 'uploads/Student_img/1-1717881630-2422548.png', 'active', 'active', 1, '2024-06-08 21:20:30', '2024-06-08 21:20:30'),
(129, '229', NULL, '2024-06-08', 'PARAMBRATA SAHA RIDDHI', NULL, 'RIPON KUMAR SAHA', NULL, '01723291959', 'CHITI SAHA', NULL, '01767557720', NULL, '01723291959', '2019-07-15', 'Male', NULL, 'HINDU', NULL, NULL, 'GOPALPUR ,PABNA', 'GOPALPUR ,PABNA', 'uploads/Student_img/1-1717882115-2422548.png', 'active', 'active', 1, '2024-06-08 21:28:35', '2024-06-08 21:28:35'),
(130, '230', NULL, '2024-06-08', 'MAIMUNA HASAN', NULL, 'RAKIBUL HASAN', NULL, '01717-516238', 'KHADIZA AKTER', NULL, '01714475037', NULL, '01714475037', '2019-07-28', 'Female', NULL, 'ISLAM', NULL, NULL, 'KALACHADPARA,PABNA', 'KALACHADPARA,PABNA', 'uploads/Student_img/1-1717882411-2825253.png', 'active', 'active', 1, '2024-06-08 21:33:31', '2024-06-08 21:33:31'),
(131, '231', NULL, '2024-06-08', 'NUR MUHAMMAD SHORON', NULL, 'MD. SUMON HOSSAN', NULL, '01783926338', 'MAIMUNA AKTER', NULL, '01705 779961', NULL, '01705779961', '2019-09-27', 'Male', NULL, 'ISLAM', NULL, NULL, 'CHAR ASUTOSPUR ,PABNA', 'CHAR ASUTOSPUR ,PABNA', 'uploads/Student_img/1-1717882705-2422548.png', 'active', 'active', 1, '2024-06-08 21:38:25', '2024-06-08 21:38:25'),
(132, '232', NULL, '2024-06-08', 'AWARUPA SHANGSTHITA BHOR', NULL, 'SREE SHAMKOMAL CHANDRA', NULL, '01736456636', 'PURNOTA ROY', NULL, '01758378441', NULL, '01758378441', '2019-09-17', 'Female', NULL, 'ISLAM', NULL, NULL, 'SIBRAMPUR ,PABNA', 'SIBRAMPUR ,PABNA', 'uploads/Student_img/1-1717884135-2825253.png', 'active', 'active', 1, '2024-06-08 22:02:15', '2024-06-08 22:02:15'),
(133, '233', NULL, '2024-06-08', 'YEANA', NULL, 'MD. YOUSUF ALI', NULL, '01761502017', 'NAZNIN AKTER', NULL, '01719167093', NULL, '01761502017', '2018-12-21', 'Female', NULL, 'ISLAM', NULL, NULL, 'RAMCHANDROPUR,PABNA', 'RAMCHANDROPUR,PABNA', 'uploads/Student_img/1-1717884499-2825253.png', 'active', 'active', 1, '2024-06-08 22:08:19', '2024-06-08 22:08:19'),
(134, '234', NULL, '2024-06-08', 'SABRINA ISLAM MINHA', NULL, 'AMIRUL ISLAM', NULL, '01711138561', 'SHANTA KHATUN', NULL, '01706568586', NULL, '01706568586', '2018-11-18', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGOBPUR ,PABNA', 'SOUTH RAGOBPUR ,PABNA', 'uploads/Student_img/1-1717884841-2825253.png', 'active', 'active', 1, '2024-06-08 22:14:01', '2024-06-08 22:14:01'),
(136, '236', NULL, '2024-06-08', 'TASHDID TOOR', NULL, 'MD. KHYRUL ISLAM', NULL, '01714424434', 'TAUFIKA YEASMIN', NULL, '01754553233', NULL, '01754553233', '2019-09-26', 'Male', NULL, 'ISLAM', NULL, NULL, 'RAMCHANDRAPUR,PABNA', 'RAMCHANDRAPUR,PABNA', 'uploads/Student_img/1-1717885516-2422548.png', 'active', 'active', 1, '2024-06-08 22:25:16', '2024-06-08 22:25:16'),
(139, '239', NULL, '2024-06-09', 'Israt  Jahan  Esha', NULL, 'Md. Helal  Pramanik', NULL, '01753424949', 'Mst.Shopna  Khatun', NULL, '01726759077', NULL, '01726759077', '2019-06-17', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1717943225-Girl.png', 'active', 'active', 1, '2024-06-09 14:27:05', '2024-06-09 14:27:05'),
(140, '240', NULL, '2024-06-09', 'Mst. Takia  Akter', NULL, 'Md. Islam', NULL, '01747559556', 'Mst.Fatm Akter', NULL, '01709882598', NULL, '01747559556', '2019-11-18', 'Female', NULL, 'Islam', NULL, NULL, 'Bolorampur,Pabna.', 'Bolorampur,Pabna.', 'uploads/Student_img/1-1717943632-Girl.png', 'active', 'active', 1, '2024-06-09 14:33:52', '2024-06-09 14:33:52'),
(141, '241', NULL, '2024-06-09', 'Adil  Mustakim  Ayan', NULL, 'Sayful  Islam  Moni', NULL, '01710457306', 'Seema  Khatun', NULL, '01721265037', NULL, '01721265037', '2018-10-23', 'Male', NULL, 'Islam', NULL, NULL, 'South  Raghobpur,Pabna.', 'South  Raghobpur,Pabna.', 'uploads/Student_img/1-1717943893-Boy.png', 'active', 'active', 1, '2024-06-09 14:38:13', '2024-06-09 14:38:13'),
(142, '242', NULL, '2024-06-09', 'Md.Sahabi  Hossen', NULL, 'Md.Monir  Hossain', NULL, '01614507656', 'Sharmin  Sultana', NULL, '01796965328', NULL, '01796965328', '2019-02-07', 'Male', NULL, 'Islam', NULL, NULL, 'Bolorampur,Pabna.', 'Bolorampur,Pabna.', 'uploads/Student_img/1-1717944139-Boy.png', 'active', 'active', 1, '2024-06-09 14:42:19', '2024-06-09 14:42:19'),
(143, '243', NULL, '2024-06-09', 'Tanjim  Parbhej', NULL, 'Md.Sakir  Parbhej', NULL, '01761884567', 'Tamanna  Afroj', NULL, '01747040900', NULL, '01747040900', '2019-10-27', 'Male', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1717944555-Boy.png', 'active', 'active', 1, '2024-06-09 14:49:15', '2024-06-09 14:49:15'),
(144, '244', NULL, '2024-06-09', 'Mumtahina  Hur', NULL, 'Md.Ziaur Rhaman', NULL, '01712542920', 'Nazia  Jabin', NULL, '01712098803', NULL, '01712542920', '2018-09-14', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717944776-Girl.png', 'active', 'active', 1, '2024-06-09 14:52:56', '2024-06-09 14:52:56'),
(145, '245', NULL, '2024-06-09', 'Md.Minhaz  Ayan Sadip', NULL, 'Md.Sagor Sardar', NULL, '01836105026', 'Mst.Popy Khatun', NULL, '01718418955', NULL, '01836105026', '2018-05-24', 'Male', NULL, 'Islam', NULL, NULL, 'Arifpur,Pabna.', 'Arifpur,Pabna.', 'uploads/Student_img/1-1717945129-Boy.png', 'active', 'active', 1, '2024-06-09 14:58:49', '2024-06-09 14:58:49'),
(146, '246', NULL, '2024-06-09', 'Awsaf Zabur', NULL, 'Kamruzzaman  Liton', NULL, '01713620992', 'Atia Sultana  Asha', NULL, '01752851762', NULL, '01752851762', '2020-01-05', 'Male', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1717945391-Boy.png', 'active', 'active', 1, '2024-06-09 15:03:11', '2024-06-09 15:03:11'),
(147, '247', NULL, '2024-06-09', 'Kazi Sadiqin Islam', NULL, 'Kazi Sobukto Gaan', NULL, '01716929426', 'Aysha Beente  Akter', NULL, '01755032587', NULL, '01716929426', '2020-08-06', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1717945889-Boy.png', 'active', 'active', 1, '2024-06-09 15:11:29', '2024-06-09 15:11:29'),
(148, '248', NULL, '2024-06-09', 'Sariya  Samroj  Pariza', NULL, 'Sharif  Kayes Mahmud  Chowdhury', NULL, '01713683452', 'Shormila  Yesmin', NULL, '01893386618', NULL, '01713683452', '2019-09-12', 'Female', NULL, 'Islam', NULL, NULL, 'Arifpur,Pabna.', 'Arifpur,Pabna.', 'uploads/Student_img/1-1717946231-Girl.png', 'active', 'active', 1, '2024-06-09 15:17:11', '2024-06-09 15:17:11'),
(149, '249', NULL, '2024-06-09', 'Md.Fuad  Ibrahim', NULL, 'Md.Habibul Islam  Fuel', NULL, '01711941185', 'Mst.Bithi Siddika', NULL, '01739898684', NULL, '01739898684', '2024-06-09', 'Male', NULL, 'Islam', NULL, NULL, 'Gopalpur,Pabna.', 'Gopalpur,Pabna.', 'uploads/Student_img/1-1717946552-Boy.png', 'active', 'active', 1, '2024-06-09 15:22:32', '2024-06-09 15:22:32'),
(150, '250', NULL, '2024-06-09', 'Khandker Shayam Rahman', NULL, 'Khandker Sadequr Rahman', NULL, '01724224466', 'Irin Aker Popy', NULL, '01775541209', NULL, '01775541209', '2017-07-22', 'Male', NULL, 'Islam', NULL, NULL, 'Gopalpur,Pabna.', 'Gopalpur,Pabna.', 'uploads/Student_img/1-1717948366-Boy.png', 'active', 'active', 1, '2024-06-09 15:52:46', '2024-06-09 15:52:46'),
(151, '251', NULL, '2024-06-09', 'Md.Mustakim Ahmed', NULL, 'Md.Mostofa Ahmed', NULL, '01744132299', 'Mst. Sanjida Akter', NULL, '01701730984', NULL, '01744132299', '2018-10-20', 'Male', NULL, 'Islam', NULL, NULL, 'South  Raghobpur,Pabna.', 'South  Raghobpur,Pabna.', 'uploads/Student_img/1-1717948633-Boy.png', 'active', 'active', 1, '2024-06-09 15:57:13', '2024-06-09 15:57:13'),
(152, '252', NULL, '2024-06-09', 'Fatima  Mehnoor', NULL, 'Md.Golam Mostofa', NULL, '01713199033', 'Jesmin Nahar', NULL, '01732049700', NULL, '01713199033', '2019-02-01', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Jhenidah', 'uploads/Student_img/1-1717948943-Girl.png', 'active', 'active', 1, '2024-06-09 16:02:23', '2024-06-09 16:02:23'),
(154, '254', NULL, '2024-06-09', 'Justina Mrinaaly mondal', NULL, 'Mr.Milton Mondol', NULL, '01719460622', 'Miss.Flora jui -D-costa', NULL, '01929285546', NULL, '01919460622', '2021-05-12', 'Female', NULL, 'Christian', NULL, NULL, 'South Raghobpyr,pabna', 'South Raghobpyr,pabna', 'uploads/Student_img/1-1717949405-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-09 16:10:05', '2025-01-21 06:13:56'),
(155, '255', NULL, '2024-06-09', 'Md. Taijul  Islam', NULL, 'Md.Aminul  Islam', NULL, '01719795621', 'Mst Rubia  Khatun', NULL, '01751424999', NULL, '01751424999', '2018-04-15', 'Male', NULL, 'Islam', NULL, NULL, 'Khuryersuti,Pabna.', 'Khuryersuti,Pabna.', 'uploads/Student_img/1-1717949407-Boy.png', 'active', 'active', 1, '2024-06-09 16:10:07', '2024-06-09 16:10:07'),
(156, '256', NULL, '2024-06-09', 'Omor Mursalin', NULL, 'Masud  Rana', NULL, '01710866639', 'Jannatul  Ferdous  Lipi', NULL, '01733868935', NULL, '01733868935', '2017-12-24', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1717949641-Boy.png', 'active', 'active', 1, '2024-06-09 16:14:01', '2024-06-09 16:14:01'),
(157, '257', NULL, '2024-06-09', 'Md.Mahmed khan Fuad', NULL, 'Md.Sarforaj khan Mamun', NULL, '01783234711', 'Champa Khatun', NULL, '01783234711', NULL, '01935344288', '2018-10-01', 'Male', NULL, 'Islam', NULL, NULL, 'South Raghobpur,pabna', 'South Raghobpur,pabna', 'uploads/Student_img/1-1717949789-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-09 16:16:29', '2024-06-09 16:16:29'),
(158, '258', NULL, '2024-06-09', 'Jannatul  Tasnim  Rinthi', NULL, 'Md.Rezaul  Karim', NULL, '01718787858', 'Mst.Shopna Khatun', NULL, '01752050720', NULL, '01711949536', '2019-06-09', 'Female', NULL, 'Islam', NULL, NULL, 'South  Raghabpur,Pabna.', 'South  Raghabpur,Pabna.', 'uploads/Student_img/1-1717950075-Girl.png', 'active', 'active', 1, '2024-06-09 16:21:15', '2024-06-09 16:21:15'),
(160, '260', NULL, '2024-06-09', 'Mst. Farhana  Khatun', NULL, 'Md.Farukh  Hossain', NULL, '01754556589', 'Sharmin  Akter', NULL, '01754556589', NULL, '01754556589', '2018-08-20', 'Female', NULL, 'Islam', NULL, NULL, 'Shabrampur,Pabna.', 'Shabrampur,Pabna.', 'uploads/Student_img/1-1717950340-Girl.png', 'active', 'active', 1, '2024-06-09 16:25:40', '2024-06-09 16:25:40'),
(161, '261', NULL, '2024-06-09', 'Wahid  Ullah  Pranto', NULL, 'Oli  Ullah', NULL, '01750979369', 'Poli', NULL, '01626757506', NULL, '01626757506', '2018-09-19', 'Male', NULL, 'Islam', NULL, NULL, 'Madarbari,Pabna.', 'Madarbari,Pabna.', 'uploads/Student_img/1-1717950528-Boy.png', 'active', 'active', 1, '2024-06-09 16:28:48', '2024-06-09 16:28:48'),
(162, '262', NULL, '2024-06-09', 'Md.Sami Al Rayhan', NULL, 'Dr. Md.Ruhid  Hossain', NULL, '01718362445', 'Dr.Samina  Akter', NULL, '01728218100', NULL, '01718362445', '2018-12-31', 'Male', NULL, 'Islam', NULL, NULL, 'Gobinda,Pabna.', 'Daspukur,Rajshahi.', 'uploads/Student_img/1-1717950861-Boy.png', 'active', 'active', 1, '2024-06-09 16:34:21', '2024-06-09 16:34:21'),
(163, '263', NULL, '2024-06-09', 'Safowet  Hossen  Sami', NULL, 'Anower  Hossen Khan', NULL, '01569168148', 'Nabila  Nourin  Khushi', NULL, '01765294111', NULL, '01569168148', '2016-12-19', 'Male', NULL, 'Islam', NULL, NULL, 'JorBangla ,Pabna.', 'JorBangla ,Pabna.', 'uploads/Student_img/1-1717951109-Boy.png', 'active', 'active', 1, '2024-06-09 16:38:29', '2024-06-09 16:38:29'),
(164, '264', NULL, '2024-06-09', 'Whjiha  Tanha', NULL, 'Oli  Ullah', NULL, '01750979369', 'Poli', NULL, '016267575506', NULL, '01626757506', '2018-09-19', 'Female', NULL, 'Islam', NULL, NULL, 'Madarbari,Pabna.', 'Madarbari,Pabna.', 'uploads/Student_img/1-1717951306-Girl.png', 'active', 'active', 1, '2024-06-09 16:41:46', '2024-06-09 16:41:46'),
(165, '265', NULL, '2024-06-09', 'S.M. Shadman  Al Hashab', NULL, 'S.M. Abdus Salam', NULL, '01715502424', 'Mst. Nazmunnahar  Hasina', NULL, '01793870524', NULL, '01715502424', '2017-09-03', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1717951595-Boy.png', 'active', 'active', 1, '2024-06-09 16:46:35', '2024-06-09 16:46:35'),
(166, '266', NULL, '2024-06-09', 'Mahbuba', NULL, 'Md.Golam Mostofa', NULL, '01713098519', 'Mst.Fatema tuj Johura', NULL, '01307924193', NULL, '01307924193', '2017-11-17', 'Female', NULL, 'Islam', NULL, NULL, 'Mojahid Clab,Pabna.', 'Mojahid Clab,Pabna.', 'uploads/Student_img/1-1717951823-Girl.png', 'active', 'active', 1, '2024-06-09 16:50:23', '2024-06-09 16:50:23'),
(167, '267', NULL, '2024-06-09', 'Md.Amir  Hamja', NULL, 'Md.Abdus  Sobur Khan', NULL, '01749155117', 'Hafija  Khatun', NULL, '01751150562', NULL, '01749155117', '2024-06-09', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1717952315-Boy.png', 'active', 'active', 1, '2024-06-09 16:58:35', '2024-06-09 16:58:35'),
(168, '268', NULL, '2024-06-09', 'RUPAM PRAMANIK', NULL, 'RATAN KUMER', NULL, '0175580743', 'TANUSREE', NULL, '01776877418', NULL, '01755580743', '2017-12-11', 'Male', NULL, 'HINDU', NULL, NULL, 'SHIBRAMPUR ,PABNAac', 'SHIBRAMPUR ,PABNAac', 'uploads/Student_img/1-1717977007-2422548.png', 'active', 'active', 1, '2024-06-09 23:50:07', '2024-06-09 23:50:07'),
(169, '269', NULL, '2024-06-09', 'MD.AZRAK HASAN', NULL, 'MD.SAIFUL HASAN', NULL, '01714565425', 'KANIZ FATEMA', NULL, '01799720717', NULL, '01714565425', '2018-12-21', 'Male', NULL, 'ISLAM', NULL, NULL, 'MONSURABAD,PABNA', 'MONSURABAD,PABNA', 'uploads/Student_img/1-1717977296-2422548.png', 'active', 'active', 1, '2024-06-09 23:54:56', '2024-06-09 23:54:56'),
(170, '270', NULL, '2024-06-09', 'JABIR AL MAHMUD', NULL, 'MD. ALI HYEDER', NULL, '01716595527', 'MST . SHARMIN AKTER', NULL, '01723 781138', NULL, '01723 781138', '2018-06-30', 'Male', NULL, 'ISLAM', NULL, NULL, 'MUNSURABAD,PABNA', 'MUNSURABAD,PABNA', 'uploads/Student_img/1-1717977616-2422548.png', 'active', 'active', 1, '2024-06-10 00:00:16', '2024-06-10 00:00:16'),
(171, '271', NULL, '2024-06-09', 'BONDON KORAIYA', NULL, 'BIPLOB KORAIYA', NULL, '01913837204', 'SEFALI BISWAS', NULL, '01935047086', NULL, '01935047086', '2018-09-26', 'Male', NULL, 'CRISTIAN', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1717977973-2422548.png', 'active', 'active', 1, '2024-06-10 00:06:13', '2024-06-10 00:06:13'),
(172, '272', NULL, '2024-06-09', 'HUSSIAIB SHEIKH SHAFIN', NULL, 'MD.MASUM SHEIKH', NULL, '01941774884', 'MST.SHOHANE PARVIN', NULL, '01782044672', NULL, '01782044672', '2018-11-02', 'Male', NULL, 'ISLAM', NULL, NULL, 'RAMCHANDRAPUR,PABNA', 'RAMCHANDRAPUR,PABNA', 'uploads/Student_img/1-1717978242-2422548.png', 'active', 'active', 1, '2024-06-10 00:10:42', '2024-06-10 00:10:42'),
(173, '273', NULL, '2024-06-09', 'RAFSINA HOSEN ANIKA', NULL, 'MD.AKMOL HOSEN', NULL, '01775118033', 'MST.AFROJA KHATUN', NULL, '01798277656', NULL, '01775118033', '2018-09-25', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1717978586-2825253.png', 'active', 'active', 1, '2024-06-10 00:16:26', '2024-06-10 00:16:26'),
(174, '274', NULL, '2024-06-09', 'DIPAON GHOSH', NULL, 'DIPOK KUMAR', NULL, '01747040103', 'ETEY RANI', NULL, '01907740478', NULL, '01747040103', '2018-10-30', 'Male', NULL, 'HINDU', NULL, NULL, 'RAMCHANDRAPUR,PABNA', 'RAMCHANDRAPUR,PABNA', 'uploads/Student_img/1-1717978844-2422548.png', 'active', 'active', 1, '2024-06-10 00:20:44', '2024-06-10 00:20:44'),
(175, '275', NULL, '2024-06-09', 'JANNATUL FERTHOUS AHONA', NULL, 'KHAZA NAZIM UDDIN', NULL, '01750858917', 'SHARMIN AKTER', NULL, '01974235100', NULL, '01750858917', '2016-07-03', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAMCHANDRAPUR ,PABNA', 'SOUTH RAMCHANDRAPUR ,PABNA', 'uploads/Student_img/1-1717979140-2825253.png', 'active', 'active', 1, '2024-06-10 00:25:40', '2024-06-10 00:25:40'),
(176, '276', NULL, '2024-06-09', 'FOUZIA AFRIN', NULL, 'ALI HOSSAIN', NULL, '01737599579', 'SHADIA TASNIM', NULL, '01886599579', NULL, '01886599579', '2017-07-21', 'Female', NULL, 'ISLAM', NULL, NULL, 'TECNICAL MORE ,PABNA', 'TECNICAL MORE ,PABNA', 'uploads/Student_img/1-1717979392-2825253.png', 'active', 'active', 1, '2024-06-10 00:29:52', '2024-06-10 00:29:52'),
(177, '277', NULL, '2024-06-09', 'RUFAIDA RAHMAN RUPONTI', NULL, 'MD.REZAUR RAHMAN', NULL, '01712600432', 'TIHIN AKTER', NULL, '01776659873', NULL, '01776659873', '2018-11-03', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR, PABNA', 'SOUTH RAGHOBPUR, PABNA', 'uploads/Student_img/1-1717979712-2825253.png', 'active', 'active', 1, '2024-06-10 00:35:13', '2024-06-10 00:35:13'),
(179, '279', NULL, '2024-06-09', 'ISAIAH SORDER', NULL, 'SYAMOL KUMAR SORDER', NULL, '01712862456', 'JOYTSNA BISWAS', NULL, '01779923539', NULL, '01712862456', '2017-10-27', 'Male', NULL, 'CHRISTIAN', NULL, NULL, 'PABNA, BOYS` HOSTEL', 'NATOR', 'uploads/Student_img/1-1717981262-2422548.png', 'active', 'active', 1, '2024-06-10 01:01:02', '2024-06-10 01:01:02'),
(180, '280', NULL, '2024-06-11', 'AYMANA AREFIN ORTHI', NULL, 'ARIF AHEMED', NULL, '01715686468', 'MOST. ROMANA KHATUN', NULL, '01712611009', NULL, '01712611009', '2020-04-10', 'Female', NULL, 'Islam', NULL, NULL, 'MONOHERPUR, TEBUNIA', 'MONOHERPUR, TEBUNIA', 'uploads/Student_img/1-1718110605-Girl.png', 'active', 'active', 1, '2024-06-11 12:56:45', '2024-06-11 12:56:45'),
(181, '281', NULL, '2024-06-11', 'MEHERIA TABASSUM', NULL, 'ARAFAT KOBIR', NULL, '01923083883', 'TASNUBA GONI', NULL, '01718769285', NULL, '01718769285', '2019-10-31', 'Female', NULL, 'Islam', NULL, NULL, 'DILALPUR,PABNA', 'DILALPUR,PABNA', 'uploads/Student_img/1-1718111535-Girl.png', 'active', 'active', 1, '2024-06-11 13:12:15', '2024-06-11 13:12:15'),
(182, '282', NULL, '2024-06-11', 'SOVOM SARKAR RHYTHM', NULL, 'RATON KUMAR', NULL, '01726788278', 'SHILPI SAHA', NULL, '01759252670', NULL, '01759252670', '2020-06-22', 'Male', NULL, 'Islam', NULL, NULL, 'GOPALPUR ,PABNA', 'GOPALPUR ,PABNA', 'uploads/Student_img/1-1718112088-Boy.png', 'active', 'active', 1, '2024-06-11 13:21:30', '2024-06-11 13:21:30'),
(183, '283', NULL, '2024-06-11', 'JANNATUL NAIM ALLISHA', NULL, 'MD. JEWEL RANA', NULL, '01310322338', 'MOST. RIA KHATUN', NULL, '01611264593', NULL, '01611264593', '2019-06-15', 'Female', NULL, 'Islam', NULL, NULL, 'DWIPCHOR, PABNA', 'DWIPCHOR, PABNA', 'uploads/Student_img/1-1718113326-Girl.png', 'active', 'active', 1, '2024-06-11 13:42:06', '2024-06-11 13:42:06');
INSERT INTO `students` (`id`, `student_id`, `admission_no`, `admission_date`, `student_name`, `bangla_name`, `father_name`, `father_nid`, `father_mobile`, `mother_name`, `mother_nid`, `mother_mobile`, `guardian_name`, `guardian_mobile`, `dob`, `gender`, `blood_group`, `religion`, `email`, `student_bc`, `present_address`, `permanent_address`, `img_url`, `sms_status`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(184, '284', NULL, '2024-06-11', 'RIZWAN AHMED', NULL, 'MD. HAFIZUR RAHMAN', NULL, '01813168791', 'RENA AKTER', NULL, '01784100716', NULL, '01784100716', '2020-01-31', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAMCHANDRAPUR,PABNA', 'SOUTH RAMCHANDRAPUR,PABNA', 'uploads/Student_img/1-1718113945-Boy.png', 'active', 'active', 1, '2024-06-11 13:52:25', '2024-06-11 13:52:25'),
(185, '285', NULL, '2024-06-11', 'ARHAM ZARIF CHOWDHURY', NULL, 'MD. SAIFUL ISLAM CHOWDHURY', NULL, '01743586926', 'MST. KANIS FATEMA', NULL, '01746027815', NULL, '01746027815', '2019-12-22', 'Male', NULL, 'Islam', NULL, NULL, 'KACARIPARA ,PABNA', 'KACARIPARA ,PABNA', 'uploads/Student_img/1-1718114798-Boy.png', 'active', 'active', 1, '2024-06-11 14:06:38', '2024-06-11 14:06:38'),
(186, '286', NULL, '2024-06-11', '0HE ROUDRO CHOWDHURY', NULL, 'MOHAMMAD RUSSEL IMAM', NULL, '01866958081', 'SADIN SAGIA', NULL, '01866958082', NULL, '01866958082', '2018-06-15', 'Male', NULL, 'Islam', NULL, NULL, 'DILALPUR,PABNA', 'DILALPUR,PABNA', 'uploads/Student_img/1-1718115209-Boy.png', 'active', 'active', 1, '2024-06-11 14:13:29', '2024-06-11 14:13:29'),
(187, '287', NULL, '2024-06-11', 'MD. ALI HASAN', NULL, 'MD.ANISUER RAHMAN', NULL, '01775053149', 'ASHA KHATUN', NULL, '01710597151', NULL, '01710597151', '2016-09-12', 'Male', NULL, 'Islam', NULL, NULL, 'DIPCHOR,PABNA', 'DIPCHOR,PABNA', 'uploads/Student_img/1-1718115417-Boy.png', 'active', 'active', 1, '2024-06-11 14:16:57', '2024-06-11 14:16:57'),
(188, '288', NULL, '2024-06-11', 'TASFIYA ZAHID', NULL, 'MD. ABDUR RAZZAK', NULL, '01716385956', 'FAHMIDA FERDOUSI', NULL, '01714851565', NULL, '01714851565', '2019-12-12', 'Female', NULL, 'Islam', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1718115667-Girl.png', 'active', 'active', 1, '2024-06-11 14:21:07', '2024-06-11 14:21:07'),
(189, '289', NULL, '2024-06-11', 'SHABIHA', NULL, 'MD. SOLAIMAN HOSSAIN', NULL, '01798261551', 'SANDA', NULL, '01753392932', NULL, '01798261551', '2018-10-17', 'Female', NULL, 'Islam', NULL, NULL, 'BOLORAMPUR, PABNA', 'BOLORAMPUR, PABNA', 'uploads/Student_img/1-1718116171-Girl.png', 'active', 'active', 1, '2024-06-11 14:29:31', '2024-06-11 14:29:31'),
(190, '290', NULL, '2024-06-11', 'Mst. Humaira  Mehjabin Himu', NULL, 'Md.Habibur  Rahman', NULL, '01722191999', 'Mst. Farzana Yesmin Shonda', NULL, '01612703540', NULL, '01612703540', '2017-04-17', 'Female', NULL, 'Islam', NULL, NULL, 'Hajirhat,Pabna.', 'Hajirhat,Pabna.', 'uploads/Student_img/1-1718120925-Girl.png', 'active', 'active', 1, '2024-06-11 15:48:45', '2024-06-11 15:48:45'),
(191, '291', NULL, '2024-06-11', 'Nusaifa  Binte  Rayhan', NULL, 'Md.Abdur  Rayhan  Nayan', NULL, '01717104242', 'Mst.Jannatul Ferdus', NULL, '01767049439', NULL, '01717104242', '2019-09-02', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1718121399-Girl.png', 'active', 'active', 1, '2024-06-11 15:56:39', '2024-06-11 15:56:39'),
(192, '292', NULL, '2024-06-11', 'SUMAIYA HAQUE NUPUR', NULL, 'NAZMUL HAQUE', NULL, '01715650204', 'MST.JANNATUL FERDUS', NULL, '01766206454', NULL, '01715650204', '2017-11-17', 'Male', NULL, 'Islam', NULL, NULL, 'BOLORAMPUR,PABNA', 'BOLORAMPUR,PABNA', 'uploads/Student_img/1-1718122899-Boy.png', 'active', 'active', 1, '2024-06-11 16:21:39', '2024-06-11 16:21:39'),
(193, '293', NULL, '2024-06-11', 'MD. ARIYEN HAQUE', NULL, 'MD. ENAMUL HAQUE', NULL, '01717912860', 'TAHMINA YESMIN', NULL, '01767250515', NULL, '01717912860', '2019-03-21', 'Male', NULL, 'Islam', NULL, NULL, 'SHIBRAMPUR,PABNA', 'SHIBRAMPUR,PABNA', 'uploads/Student_img/1-1718123151-Boy.png', 'active', 'active', 1, '2024-06-11 16:25:51', '2024-06-11 16:25:51'),
(194, '294', NULL, '2024-06-11', 'MUHAMMAD ARHAM', NULL, 'MD. RAFIKUN NABI', NULL, '01712673784', 'SHIFAT-E-SHAMS', NULL, '01798202545', NULL, '01798202545', '2018-08-09', 'Male', NULL, 'Islam', NULL, NULL, 'KACHARIPARA,PABNA', 'KACHARIPARA,PABNA', 'uploads/Student_img/1-1718123529-Boy.png', 'active', 'active', 1, '2024-06-11 16:32:09', '2024-06-11 16:32:09'),
(197, '297', NULL, '2024-06-11', 'ABDUL MUQTADIR', NULL, 'MD. MOSSHARROF HOSSOIN', NULL, '01670900439', 'MST. MURSEDA AKTER', NULL, '01756599978', NULL, '01756599978', '2019-05-06', 'Male', NULL, 'Islam', NULL, NULL, 'BANGLA BAZER,PABNA', 'BANGLA BAZER,PABNA', 'uploads/Student_img/1-1718124449-Boy.png', 'active', 'active', 1, '2024-06-11 16:47:29', '2024-06-11 16:47:29'),
(198, '298', NULL, '2024-06-11', 'TAHIYA TAJBIRA', NULL, 'MD. TARIKUL ISLAM', NULL, '01720332457', 'MST.NUPUR KHATUN', NULL, '01775571657', NULL, '01775571657', '2018-07-09', 'Female', NULL, 'Islam', NULL, NULL, 'ARIFPUR , PABNA', 'ARIFPUR , PABNA', 'uploads/Student_img/1-1718124675-Girl.png', 'active', 'active', 1, '2024-06-11 16:51:15', '2024-06-11 16:51:15'),
(199, '299', NULL, '2024-06-11', 'HERA', NULL, 'MD. HERO BHAHADUR', NULL, '01749155213', 'MST.URMILA', NULL, '01770182115', NULL, '01770182115', '2018-01-15', 'Female', NULL, 'Islam', NULL, NULL, 'BAGGABARI ,TEBUNIYA,PABNA', 'BAGGABARI ,TEBUNIYA,PABNA', 'uploads/Student_img/1-1718124934-Girl.png', 'active', 'active', 1, '2024-06-11 16:55:34', '2024-06-11 16:55:34'),
(200, '300', NULL, '2024-06-11', 'ASIA AKTER MISHTY', NULL, 'MD. SHOBUJ HOSSAIN', NULL, '01705907733', 'NILA KHATUN', NULL, '01708765947', NULL, '01708765947', '2017-07-04', 'Female', NULL, 'Islam', NULL, NULL, 'BROJONATHPUR ,PABNA', 'BROJONATHPUR ,PABNA', 'uploads/Student_img/1-1718125211-Girl.png', 'active', 'active', 1, '2024-06-11 17:00:11', '2024-06-11 17:00:11'),
(201, '301', NULL, '2024-06-11', 'ABDUR RAHMAN', NULL, 'DABIR UDDIN', NULL, 'N/A', 'SHERAJUL MONIRA', NULL, '01725929134', NULL, '01725929134', '2016-06-02', 'Male', NULL, 'Islam', NULL, NULL, 'EDWARD COLLEGE ROAD,PABNA', 'EDWARD COLLEGE ROAD,PABNA', 'uploads/Student_img/1-1718125473-Boy.png', 'active', 'active', 1, '2024-06-11 17:04:33', '2024-06-11 17:04:33'),
(202, '302', NULL, '2024-06-11', 'UMME FATEMA', NULL, 'DABIR UDDIN', NULL, 'N/A', 'SHERAJUM MONIRA', NULL, '01725929134', NULL, '01725929134', '2016-06-02', 'Female', NULL, 'Islam', NULL, NULL, 'EDWARD COLLEGE ROAD, PABNA', 'EDWARD COLLEGE ROAD, PABNA', 'uploads/Student_img/1-1718125725-Girl.png', 'active', 'active', 1, '2024-06-11 17:08:45', '2024-06-11 17:08:45'),
(203, '303', NULL, '2024-06-11', 'ADDIN AL ASHFI', NULL, 'MD. ATIKUL ISLAM', NULL, '01844907720', 'MOUSUME AKTER', NULL, '01922409465', NULL, '01844907720', '2017-04-14', 'Male', NULL, 'Islam', NULL, NULL, 'DILALPUR,PABNA', 'DILALPUR,PABNA', 'uploads/Student_img/1-1718125958-Boy.png', 'active', 'active', 1, '2024-06-11 17:12:38', '2024-06-11 17:12:38'),
(204, '304', NULL, '2024-06-11', 'TAHSAN ABIR SORON', NULL, 'MD. ASHRAFUL ISLAM', NULL, '6585911590', 'MOST .SRETI KHATUN', NULL, '01726403558', NULL, '01726403558', '2018-07-03', 'Male', NULL, 'Islam', NULL, NULL, 'BOLORAMPUR,PABNA', 'BOLORAMPUR,PABNA', 'uploads/Student_img/1-1718126198-Boy.png', 'active', 'active', 1, '2024-06-11 17:16:38', '2024-06-11 17:16:38'),
(205, '305', NULL, '2024-06-11', 'FAIRUJE AHMED FIJA', NULL, 'MD. FARUQUE AHMED', NULL, '01774939496', 'NUSRAT ZAMAN', NULL, '01786197600', NULL, '01774939496', '2019-07-30', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1718126457-Girl.png', 'active', 'active', 1, '2024-06-11 17:20:57', '2024-06-11 17:20:57'),
(207, '307', NULL, '2024-06-11', 'Md.Affan  Islam', NULL, 'Saiful  Islam', NULL, '01723512290', 'Mst.Afroza Akter Akhi', NULL, '01773094144', NULL, '01723512290', '2018-10-31', 'Male', NULL, 'Islam', NULL, NULL, 'Khayarsuti,Pabna.', 'Khayarsuti,Pabna.', 'uploads/Student_img/1-1718127284-Boy.png', 'active', 'active', 1, '2024-06-11 17:34:44', '2024-06-11 17:34:44'),
(208, '308', NULL, '2024-06-11', 'Jannatul  Mawa  Aisha', NULL, 'Md.Jewel  Rana', NULL, '01310322338', 'Mst.Ria Khatun', NULL, '01611264593', NULL, '01611264593', '2017-02-14', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1718127550-Girl.png', 'active', 'active', 1, '2024-06-11 17:39:10', '2024-06-11 17:39:10'),
(209, '309', NULL, '2024-06-11', 'Usman Nur  Affan', NULL, 'Md.Belal Hossain', NULL, '01711978845', 'Sauda Nasrin  Sultana', NULL, '01302676191', NULL, '01302676191', '2018-03-07', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1718127834-Boy.png', 'active', 'active', 1, '2024-06-11 17:43:54', '2024-06-11 17:43:54'),
(210, '310', NULL, '2024-06-11', 'Arisha  Tasfia', NULL, 'Mahadi  hasan', NULL, '01799014161', 'Kamona  Pervin', NULL, '01777572058', NULL, '01799014161', '2024-01-14', 'Female', NULL, 'Islam', NULL, NULL, 'South  Raghabpur,Pabna.', 'South  Raghabpur,Pabna.', 'uploads/Student_img/1-1718128100-Girl.png', 'active', 'active', 1, '2024-06-11 17:48:20', '2024-06-11 17:48:20'),
(211, '311', NULL, '2024-06-11', 'Israt  Jahan  Taiba', NULL, 'Md.Nahid  Hasan', NULL, '01734345282', 'Sabina Rahman', NULL, '01734345282', NULL, '01734345282', '2018-08-24', 'Female', NULL, 'Islam', NULL, NULL, 'South  Raghabpur,Pabna.', 'South  Raghabpur,Pabna.', 'uploads/Student_img/1-1718128313-Girl.png', 'active', 'active', 1, '2024-06-11 17:51:53', '2024-06-11 17:51:53'),
(212, '312', NULL, '2024-06-11', 'Fatama  Munthana  Jui', NULL, 'Syed  Mokter  Hossain', NULL, '01725929212', 'Tania  Afroz', NULL, '01736848067', NULL, '01736848067', '2019-04-19', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1718128564-Girl.png', 'active', 'active', 1, '2024-06-11 17:56:04', '2024-06-11 17:56:04'),
(213, '313', NULL, '2024-06-11', 'Mst.Rukaiya  Khanom', NULL, 'Md.Asaduzzaman', NULL, '01751815554', 'Mst. Nasrin  Khatun', NULL, '01517027591', NULL, '01751815554', '2018-01-01', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1718128884-Girl.png', 'active', 'active', 1, '2024-06-11 18:01:24', '2024-06-11 18:01:24'),
(214, '314', NULL, '2024-06-11', 'Ummeya  Souda', NULL, 'Md.Mashiur Rahman', NULL, '01731778617', 'Msr.Sweety Khatun', NULL, '01709360135', NULL, '01709360135', '2018-03-13', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1718129092-Girl.png', 'active', 'active', 1, '2024-06-11 18:04:52', '2024-06-11 18:04:52'),
(215, '315', NULL, '2024-06-11', 'Md.Suaib  Zahin', NULL, 'Md.Zahangir  Alom', NULL, '01724243257', 'Sumaiya  Sharmin', NULL, '01721798350', NULL, '01712337705', '2018-08-20', 'Male', NULL, 'Islam', NULL, NULL, 'Auta,Pabna.', 'Auta,Pabna.', 'uploads/Student_img/1-1718129297-Boy.png', 'active', 'active', 1, '2024-06-11 18:08:17', '2024-06-11 18:08:17'),
(216, '316', NULL, '2024-06-11', 'Tasfia  Tabassum', NULL, 'Md.Sukur  Ali', NULL, '01303177208', 'Karima  Khatun', NULL, '01764631774', NULL, '01764631774', '2018-06-02', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1718129482-Girl.png', 'active', 'active', 1, '2024-06-11 18:11:22', '2024-06-11 18:11:22'),
(217, '317', NULL, '2024-06-11', 'Mobashshira  Mamun  Manha', NULL, 'Abdulla  Al  Mamun', NULL, '01716824388', 'Sumia  Akter  Suma', NULL, '01789480450', NULL, '01716824388', '2020-02-03', 'Female', NULL, 'Islam', NULL, NULL, 'Purbo Shaigaria,Pabna.', 'Purbo Shaigaria,Pabna.', 'uploads/Student_img/1-1718129728-Girl.png', 'active', 'active', 1, '2024-06-11 18:15:28', '2024-06-11 18:15:28'),
(218, '318', NULL, '2024-06-11', 'Tabassum  Islam', NULL, 'Md.Tasikul Islam', NULL, '01733036193', 'Shima Khatun', NULL, '01314197169', NULL, '01314197169', '2018-06-04', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1718130003-Girl.png', 'active', 'active', 1, '2024-06-11 18:20:03', '2024-06-11 18:20:03'),
(219, '319', NULL, '2024-06-11', 'Md.Talha Arman Tur', NULL, 'Md.Abul Kalam', NULL, '01714424408', 'Mst.Sumi Khatun', NULL, '01777483874', NULL, '01777483874', '2020-02-08', 'Male', NULL, 'Islam', NULL, NULL, 'South  Raghobpur,Pabna.', 'South  Raghobpur,Pabna.', 'uploads/Student_img/1-1718130254-Boy.png', 'active', 'active', 1, '2024-06-11 18:24:14', '2024-06-11 18:24:14'),
(220, '320', NULL, '2024-06-11', 'Md.Rakibul  Mojib', NULL, 'Md.Sanaul  Islam', NULL, '01700969000', 'Mst.Ambia  Begum', NULL, '01700968877', NULL, '01700968822', '2018-12-30', 'Male', NULL, 'Islam', NULL, NULL, 'South  Raghobpur,Pabna.', 'South  Raghabpur,Pabna.', 'uploads/Student_img/1-1718130499-Boy.png', 'active', 'active', 1, '2024-06-11 18:28:19', '2024-06-11 18:28:19'),
(222, '322', NULL, '2024-06-12', 'Saima  Islam', NULL, 'Md. Shaidul Islam', NULL, '0174440687', 'Rupa  Islam', NULL, '01720906989', NULL, '01720906989', '2015-06-01', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1718194987-Girl.png', 'unactive', 'unactive', 1, '2024-06-12 12:23:07', '2025-02-02 00:14:05'),
(223, '323', NULL, '2024-06-12', 'Nahla  Tahsin  Snigdha', NULL, 'Md.Nazmul  Hoque', NULL, '01728585375', 'Mina  Khatun', NULL, '01784312331', NULL, '01784312331', '2016-12-31', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1718195716-Girl.png', 'unactive', 'unactive', 1, '2024-06-12 12:35:16', '2025-02-02 00:13:53'),
(224, '324', NULL, '2024-06-12', 'Samir  Sadid  Shwomya', NULL, 'Md.Dip', NULL, '01710496448', 'Sharmima  Jarin', NULL, '01818614330', NULL, '01818614330', '2015-12-21', 'Male', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1718195949-Boy.png', 'unactive', 'unactive', 1, '2024-06-12 12:39:10', '2025-02-02 00:13:41'),
(225, '325', NULL, '2024-06-12', 'Mst.Jannatul  Ferdous', NULL, 'Md.Jilal Uddin', NULL, '01774744728', 'Mst.Marina  Khatun', NULL, '01311778472', NULL, '01311778472', '2016-04-24', 'Female', NULL, 'Islam', NULL, NULL, 'Dogachi,Pabna.', 'Dogachi,Pabna.', 'uploads/Student_img/1-1718196194-Girl.png', 'unactive', 'unactive', 1, '2024-06-12 12:43:14', '2025-02-02 00:13:31'),
(228, '328', NULL, '2024-06-12', 'ARAFAT HOSSAIN', NULL, 'SHAFIQUL ISLAM', NULL, '01970553031', 'JANNATUL FERDOUS', NULL, '01970553031', NULL, '01777554111', '2018-04-02', 'Male', NULL, 'Islam', NULL, NULL, 'LASKERPUR,PABNA', 'LASKERPUR,PABNA', 'uploads/Student_img/1-1718211312-Boy.png', 'active', 'active', 1, '2024-06-12 16:55:12', '2024-06-12 16:55:12'),
(229, '329', NULL, '2024-06-12', 'MD. SAJIM PRAMANIK', NULL, 'MD. SAMIM PRAMANIK', NULL, '01720621129', 'MANIA PARVIN', NULL, '01771110843', NULL, '01720621129', '2019-05-03', 'Male', NULL, 'Islam', NULL, NULL, 'BROJONATHPUR,DOGACHI', 'BROJONATHPUR,DOGACHI', 'uploads/Student_img/1-1718211530-Boy.png', 'active', 'active', 1, '2024-06-12 16:58:50', '2024-06-12 16:58:50'),
(231, '331', NULL, '2024-06-12', 'TASNIM JAHAN ROZA', NULL, 'MD. ALAUDDIN', NULL, '01728717177', 'MST. NOYON TARA', NULL, '01749635786', NULL, '01749635786', '2015-07-06', 'Female', NULL, 'Islam', NULL, NULL, 'MUNSURABAD,PABNA', 'MUNSURABAD,PABNA', 'uploads/Student_img/1-1718212634-Girl.png', 'unactive', 'unactive', 1, '2024-06-12 17:17:14', '2025-02-02 00:13:22'),
(232, '332', NULL, '2024-06-12', 'AJMIR HOSSAIN MARJAN', NULL, 'MD. RUBLE HOSSAIN MRIDHA', NULL, '01778612322', 'MST.KHUKI KHATUN', NULL, '01849239926', NULL, '01778612322', '2018-03-06', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAM CHANDRAPUR ,PABNA', 'SOUTH RAM CHANDRAPUR ,PABNA', 'uploads/Student_img/1-1718212962-Boy.png', 'active', 'active', 1, '2024-06-12 17:22:42', '2024-06-12 17:22:42'),
(234, '334', NULL, '2024-06-12', 'Md.Amir  hamja', NULL, 'Md.Abdus Sobur  Khan', NULL, '01749155117', 'Hafija  Khatun', NULL, '01751150562', NULL, '01749155117', '2016-09-28', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1718215397-Boy.png', 'active', 'active', 1, '2024-06-12 18:03:17', '2024-06-12 18:03:17'),
(235, '335', NULL, '2024-06-12', 'Arabia  Adiath', NULL, 'Md.Ariful  Islam', NULL, '01714630675', 'Ismat  Zerin', NULL, '01799691439', NULL, '01799691439', '2018-12-25', 'Female', NULL, 'Islam', NULL, NULL, 'Munsurabad,Pabna.', 'Munsurabad,Pabna.', 'uploads/Student_img/1-1718215656-Girl.png', 'active', 'active', 1, '2024-06-12 18:07:36', '2024-06-12 18:07:36'),
(236, '336', NULL, '2024-06-12', 'Ryka  Biswash Arohi', NULL, 'Md.Liton  Biswash', NULL, '01797709212', 'Mst.Asa  Khatun', NULL, '01797709212', NULL, '01797709212', '2017-11-16', 'Female', NULL, 'Islam', NULL, NULL, 'Dublia,Pabna.', 'Dublia,Pabna.', 'uploads/Student_img/1-1718215953-Girl.png', 'active', 'active', 1, '2024-06-12 18:12:33', '2024-06-12 18:12:33'),
(246, '346', NULL, '2024-06-13', 'NUSAIBA JANNAT', NULL, 'MD. MAFIZUR RAHMAN', NULL, '01708965011', 'MASUMA KHATUN', NULL, '01558647305', NULL, '01718900517', '2018-12-01', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1718285979-Girl.png', 'active', 'active', 1, '2024-06-13 13:39:39', '2024-06-13 13:39:39'),
(248, '348', NULL, '2024-06-20', 'Fabiha Fatema Shaiyarah', NULL, 'Md.Nurul Azam Tonoy', NULL, '01716050794', 'Sumaiya Islam  Shanti', NULL, '01789921683', NULL, '01789921683', '2019-08-16', 'Female', NULL, 'Islam', NULL, NULL, 'South Raghobpur,. Pabna', 'South Raghobpur,. Pabna', 'uploads/Student_img/1-1718895138-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-20 08:52:19', '2024-06-20 08:52:19'),
(249, '349', NULL, '2024-06-20', 'Mahjabin Kibria Jannat', NULL, 'Naim kibria', NULL, '01711101006', 'Tahia kibria', NULL, '01759893143', NULL, '01759893143', '2019-06-01', 'Female', NULL, 'Islan', NULL, NULL, 'Gopalpur,pabna', 'Gopalpur,pabna', 'uploads/Student_img/1-1718921206-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-20 16:06:46', '2024-06-20 16:06:46'),
(250, '350', NULL, '2024-06-20', 'Md. Sadman kabir', NULL, 'Md. Junayed kabir', NULL, '01711013776', 'Samira khan', NULL, '01728519292', NULL, '01711013776', '2021-08-11', 'Male', NULL, 'Islam', NULL, NULL, 'Robinogar,gobinda,pabna', 'Robinogar,gobinda,pabna', 'uploads/Student_img/1-1718921523-2422548.png', 'active', 'active', 1, '2024-06-20 16:12:03', '2024-06-20 16:12:03'),
(251, '351', NULL, '2024-06-20', 'Mahammad Abu Aanas', NULL, 'Md. Imran Hossain', NULL, '01710342617', 'Mahi Nur Islam', NULL, '01303305339', NULL, '01303305339', '2017-12-13', 'Male', NULL, 'Islam', NULL, NULL, 'Mondolpara,pabna', 'Mondolpara,pabna', 'uploads/Student_img/1-1718922108-2422548.png', 'active', 'active', 1, '2024-06-20 16:21:49', '2024-06-20 16:21:49'),
(252, '352', NULL, '2024-06-20', 'Mursalin Hasnayen Mayan', NULL, 'Khalid Hasnayen', NULL, '01323604503', 'Zannatul  Ferdous', NULL, '01731480501', NULL, '01731480501', '2020-03-18', 'Male', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna', 'Kacharipara,Pabna', 'uploads/Student_img/1-1718922430-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-20 16:27:10', '2024-06-20 16:27:10'),
(253, '353', NULL, '2024-06-20', 'Aahil Bin Ashraf', NULL, 'Md. Ashraful Islam', NULL, '01819685709', 'Anjuman Ferdous', NULL, '01738347598', NULL, '01738347598', '2018-12-16', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,pabna', 'Dilalpur,pabna', 'uploads/Student_img/1-1718922726-2422548.png', 'active', 'active', 1, '2024-06-20 16:32:06', '2024-06-20 16:32:06'),
(254, '354', NULL, '2024-06-20', 'Sara Islam Raiya', NULL, 'Md. Shofiqul Islan Rana', NULL, '01894208664', 'Mst. Bithi Khatun', NULL, '01753283965', NULL, '01719665527', '2017-08-03', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna', 'Dipchar,Pabna', 'uploads/Student_img/1-1718923047-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-20 16:37:27', '2024-06-20 16:37:27'),
(255, '355', NULL, '2024-06-20', 'Md.Safayat Islam Sad', NULL, 'Md. Shamim Hossain', NULL, '01711417828', 'Amira Akter Shila', NULL, '01703486086', NULL, '01711417828', '2018-07-06', 'Male', NULL, 'Islam', NULL, NULL, 'Kulonia Pabna', 'Kulonia Pabna', 'uploads/Student_img/1-1718923392-2422548.png', 'active', 'active', 1, '2024-06-20 16:43:12', '2024-06-20 16:43:12'),
(256, '356', NULL, '2024-06-20', 'Mst. Israt Jahan', NULL, 'Md.Rasel', NULL, '01716513610', 'Mst. Mahbuba Khatun', NULL, '01792884747', NULL, '01716513610', '2018-03-26', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur, pabna', 'Dilalpur, pabna', 'uploads/Student_img/1-1718923722-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-20 16:48:42', '2024-06-20 16:48:42'),
(257, '357', NULL, '2024-06-20', 'Shafin Izhaan Joy', NULL, 'Md. Bayazid Bustamu', NULL, '01725432221', 'Shaila Aroz', NULL, '01934439388', NULL, '01934439388', '2020-10-20', 'Male', NULL, 'Islam', NULL, NULL, 'Gopalur,Pabna', 'Gopalur,Pabna', 'uploads/Student_img/1-1718924043-2422548.png', 'active', 'active', 1, '2024-06-20 16:54:03', '2024-06-20 16:54:03'),
(258, '358', NULL, '2024-06-23', 'Md.Tahmid Ferbous', NULL, 'Md.Masud Rana', NULL, '01712593964', 'Shamima Sultana', NULL, '01777442930', NULL, '01712593964', '2020-01-01', 'Male', NULL, 'Islam', NULL, NULL, 'Chakramanandopur,pabna', 'Chakramanandopur,pabna', 'uploads/Student_img/1-1719179650-2422548.png', 'active', 'active', 1, '2024-06-23 15:54:10', '2024-06-23 15:54:10'),
(259, '359', NULL, '2024-06-23', 'Orthi Ghosh', NULL, 'Bishwagit Ghosh', NULL, '01718741930', 'Beauty Ghosh', NULL, '01748262975', NULL, '01718741930', '2018-05-06', 'Female', NULL, 'Hindhu', NULL, NULL, 'Pathortola,Dilalpur,pabna', 'Pathortola,Dilalpur,pabna', 'uploads/Student_img/1-1719179989-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-23 15:59:49', '2024-06-23 15:59:49'),
(260, '360', NULL, '2024-06-23', 'Md. Arifin shovo', NULL, 'Md. Tofazzol Hossion', NULL, '01754812027', 'Mst. Chompa Khatun', NULL, '01745680168', NULL, '01754812027', '2017-09-19', 'Male', NULL, 'Islam', NULL, NULL, 'Bolorampur,Pabna', 'Bolorampur,Pabna', 'uploads/Student_img/1-1719180290-2422548.png', 'active', 'active', 1, '2024-06-23 16:04:50', '2024-06-23 16:04:50'),
(261, '361', NULL, '2024-06-23', 'Fariyal Azad Toushi', NULL, 'Mehadi Azad', NULL, '01624577795', 'Moriom Khatun', NULL, '01785547004', NULL, '01729139817', '2018-04-18', 'Female', NULL, 'Islam', NULL, NULL, 'South Raghobpur, pabna', 'South Raghobpur, pabna', 'uploads/Student_img/1-1719180634-dummy-woman-570x570.png', 'active', 'active', 1, '2024-06-23 16:10:34', '2024-06-23 16:10:34'),
(265, '365', NULL, '2024-06-27', 'NUSAIBA JANNAT', NULL, 'MD. MAFIZUR RAHMAN', NULL, '01718965011', 'MASUMA KHATUN', NULL, '01736872435', NULL, '01718900517', '2018-07-01', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1719494247-Girl.png', 'active', 'active', 1, '2024-06-27 07:17:27', '2024-06-27 07:17:27'),
(266, '366', NULL, '2024-06-27', 'KHONDOKAR TANZIA HOSSAN', NULL, 'KHONDOKAR BORHANUR HASSAN', NULL, '01710986623', 'TAJKIA TAMANNA', NULL, '01772275007', NULL, '01772275007', '2021-06-29', 'Female', NULL, 'Islam', NULL, NULL, 'JOTGORI JALALPUR , PABNA', 'JOTGORI JALALPUR , PABNA', 'uploads/Student_img/1-1719494589-Girl.png', 'active', 'active', 1, '2024-06-27 07:23:09', '2024-06-27 07:23:09'),
(269, '369', NULL, '2024-06-29', 'DIL AZWAD KHAN', NULL, 'MD. DIL AZAM KHAN', NULL, '01713745823', 'MST. SALMA SULTANA', NULL, '01704809197', NULL, '01704809197', '2020-09-28', 'Male', NULL, 'ISLAM', NULL, NULL, 'RADHANAGAR,PABNA', 'RADHANAGAR,PABNA', 'uploads/Student_img/1-1719703748-2422548.png', 'active', 'active', 1, '2024-06-29 17:29:08', '2024-06-29 17:29:08'),
(274, '374', NULL, '2024-06-30', 'Jannatul Ferdaus  Jinat', NULL, 'Md. Kawsar Mamud', NULL, '01747567129', 'Mst.Shima Khatun', NULL, '01889670329', NULL, '01889670329', '2019-08-15', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1719757022-Girl.png', 'active', 'active', 1, '2024-06-30 08:17:02', '2024-06-30 08:17:02'),
(275, '375', NULL, '2024-06-30', 'Mohammad  Magh', NULL, 'Md.Masud  Rana', NULL, '01709637638', 'Mst.Tisha Khatun', NULL, '01799326662', NULL, '01723056577', '2019-11-10', 'Male', NULL, 'Islam', NULL, NULL, 'Munsurabad  Abashik . Pabna.', 'Munsurabad  Abashik . Pabna.', 'uploads/Student_img/1-1719757309-Boy.png', 'active', 'active', 1, '2024-06-30 08:21:49', '2024-06-30 08:21:49'),
(283, '383', NULL, '2024-06-30', 'Aiman  Arish  Shan', NULL, 'Md. Forman  Ali Rose', NULL, '01858881494', 'Jomjom Nahar', NULL, '01826073262', NULL, '01858881494', '2020-08-08', 'Male', NULL, 'Islam', NULL, NULL, 'Arifpur,Pabna.', 'Arifpur,Pabna.', 'uploads/Student_img/1-1719760958-Boy.png', 'active', 'active', 1, '2024-06-30 09:22:38', '2024-06-30 09:22:38'),
(284, '384', NULL, '2024-06-30', 'Jawad  al Taseen', NULL, 'Md.Atikul  Islam', NULL, '01844907720', 'Mousumi  Akther', NULL, '01922409465', NULL, '01844907720', '2019-02-24', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1719761326-Boy.png', 'active', 'active', 1, '2024-06-30 09:28:46', '2024-06-30 09:28:46'),
(288, '388', NULL, '2024-06-30', 'MD. AHAD ARAFAT', NULL, 'MOHAMMAD AMZAD HOSSAIN', NULL, '01799318182', 'SHIRIN AKTER', NULL, '01799318182', NULL, '01799318182', '2021-07-05', 'Male', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR ,PABNA', 'RAMCHANDRAPUR ,PABNA', 'uploads/Student_img/1-1719763226-Boy.png', 'active', 'active', 1, '2024-06-30 10:00:26', '2024-06-30 10:00:26'),
(299, '399', NULL, '2024-06-30', 'AL ARAF RIHAN', NULL, 'ABUL BASHAR', NULL, '01701080546', 'MILI AKTER', NULL, '01706338166', NULL, '01706338166', '2019-01-20', 'Male', NULL, 'Islam', NULL, NULL, 'SHADUPARA ,PABNA', 'SHADUPARA ,PABNA', 'uploads/Student_img/1-1719767156-Boy.png', 'active', 'active', 1, '2024-06-30 11:05:56', '2024-06-30 11:05:56'),
(300, '400', NULL, '2024-06-30', 'AL ARAF RIHAN', NULL, 'ABUL BASHAR', NULL, '01701080546', 'MILI AKTER', NULL, '01706338166', NULL, '01706338166', '2019-01-20', 'Male', NULL, 'Islam', NULL, NULL, 'SHADUPARA ,PABNA', 'SHADUPARA ,PABNA', 'uploads/Student_img/1-1719767278-Boy.png', 'active', 'active', 1, '2024-06-30 11:07:58', '2024-06-30 11:07:58'),
(301, '401', NULL, '2024-07-01', 'FUHIM SHARIAR', NULL, 'MD. NASIR  UDDIN', NULL, '01743942040', 'MIS FATEMA UKTER', NULL, '01749230807', NULL, '01749230807', '2020-03-24', 'Male', NULL, 'Islam', NULL, NULL, 'BOLORAMPUR ,PABNA', 'BOLORAMPUR ,PABNA', 'uploads/Student_img/1-1719829592-Boy.png', 'active', 'active', 1, '2024-07-01 04:26:32', '2024-07-01 04:26:32'),
(302, '402', NULL, '2024-07-01', 'AL ARAF FALAK', NULL, 'MD. SAIFUL ZAMAN', NULL, '01319560565', 'MST RASHMA AKTER', NULL, '01979663249', NULL, '01979663249', '2019-10-07', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR ,PABNA', 'SOUTH RAGHOBPUR ,PABNA', 'uploads/Student_img/1-1719829967-Boy.png', 'active', 'active', 1, '2024-07-01 04:32:47', '2024-07-01 04:32:47'),
(304, '404', NULL, '2024-07-01', 'GALIBUL ISLAM', NULL, 'BAPPI HASAN', NULL, '01766987914', 'SULTANA BEGAM', NULL, '01739516879', NULL, '01761318497', '2020-03-12', 'Male', NULL, 'Islam', NULL, NULL, 'NAGIRPUR HATPARA,PABNA', 'NAGIRPUR HATPARA,PABNA', 'uploads/Student_img/1-1719830350-Boy.png', 'active', 'active', 1, '2024-07-01 04:39:10', '2024-07-01 04:39:10'),
(305, '405', NULL, '2024-07-01', 'ANISA', NULL, 'SHAKIL', NULL, '01717329441', 'LABONI', NULL, '01715564294', NULL, '01715564294', '2019-04-06', 'Female', NULL, 'Islam', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1719830671-Girl.png', 'active', 'active', 1, '2024-07-01 04:44:31', '2024-07-01 04:44:31'),
(306, '406', NULL, '2024-07-01', 'FARHANA FARIN', NULL, 'MIR YEAHIN', NULL, '01602413120', 'MST SANZIDA AKTER', NULL, '01721339447', NULL, '01721339447', '2020-09-19', 'Female', NULL, 'Islam', NULL, NULL, 'DOHARPARA ,PABNA', 'DOHARPARA ,PABNA', 'uploads/Student_img/1-1719830858-Girl.png', 'active', 'active', 1, '2024-07-01 04:47:38', '2024-07-01 04:47:38'),
(307, '407', NULL, '2024-07-01', 'SAMA MEHZABIN', NULL, 'MD. MUKTER HOSEN', NULL, '01714689879', 'ABU SALEHA SURAYA', NULL, '01722539695', NULL, '01722539695', '2020-02-10', 'Female', NULL, 'Islam', NULL, NULL, 'DIPCHAR,PABNA', 'DIPCHAR,PABNA', 'uploads/Student_img/1-1719831084-Girl.png', 'active', 'active', 1, '2024-07-01 04:51:24', '2024-07-01 04:51:24'),
(308, '408', NULL, '2024-07-01', 'ADITYA ROY BHATTACHARJEE', NULL, 'UDOY SARKER BHATTACHARJEE', NULL, '01703177455', 'SUPARNA CHAKRAWARTI', NULL, '01828740000', NULL, '01703177455', '2019-04-04', 'Male', NULL, 'Islam', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1719831412-Boy.png', 'active', 'active', 1, '2024-07-01 04:56:52', '2024-07-01 04:56:52'),
(309, '409', NULL, '2024-07-01', 'MD.RAFIUR RAHMAN', NULL, 'MD.MAHFUZUR RAHMAN', NULL, '01303053392', 'MST.SOBI KHATUN', NULL, '01983715641', NULL, '01983715641', '2018-01-01', 'Male', NULL, 'Islam', NULL, NULL, 'CHATIYANI ,PABNA', 'CHATIYANI ,PABNA', 'uploads/Student_img/1-1719831660-Boy.png', 'active', 'active', 1, '2024-07-01 05:01:00', '2024-07-01 05:01:00'),
(313, '413', NULL, '2024-07-01', 'SHAFAITH HOSSAIN SAMIR', NULL, 'SELIM HOSSAIN', NULL, '01307140057', 'SMRITI KHATUN', NULL, '01750844670', NULL, '01307140057', '2018-02-15', 'Male', NULL, 'Islam', NULL, NULL, 'KALACHADPARA ,PABNA', 'KALACHADPARA ,PABNA', 'uploads/Student_img/1-1719850243-Boy.png', 'active', 'active', 1, '2024-07-01 10:10:43', '2024-07-01 10:10:43'),
(314, '414', NULL, '2024-07-01', 'RAJANYA BHATTACHARJEE', NULL, 'RAJADHISH BHATTACHARJEE', NULL, '01716585184', 'TOMPA CHAKROBORTY', NULL, '01724776648', NULL, '01724776648', '2018-10-10', 'Female', NULL, 'Islam', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1719850525-Girl.png', 'active', 'active', 1, '2024-07-01 10:15:25', '2024-07-01 10:15:25'),
(315, '415', NULL, '2024-07-01', 'TAJRIAN', NULL, 'SHIPON ALI', NULL, '01712623681', 'ROKSHANA', NULL, '01795669404', NULL, '01712623681', '2018-08-03', 'Male', NULL, 'Islam', NULL, NULL, 'KUTHIPARA ,PABNA', 'KUTHIPARA ,PABNA', 'uploads/Student_img/1-1719850718-Boy.png', 'active', 'active', 1, '2024-07-01 10:18:38', '2024-07-01 10:18:38'),
(337, '437', NULL, '2024-07-02', 'NURAIN ISLAM TANBIR', NULL, 'MILON HOSSAIN', NULL, '01758906767', 'MOST. TANIA KHATUN', NULL, '01754744137', NULL, '01754744137', '2019-05-11', 'Male', NULL, 'Islam', NULL, NULL, 'BROJONATHPUR ,DOGACHI, PABNA', 'BROJONATHPUR ,DOGACHI, PABNA', 'uploads/Student_img/1-1719937237-Boy.png', 'active', 'active', 1, '2024-07-02 10:20:37', '2024-07-02 10:20:37'),
(359, '459', NULL, '2024-07-03', 'Tasrik  Ahmed  Jeon', NULL, 'Sohanur  Rahman', NULL, '01712930170', 'Bristy  Akter', NULL, '01793367227', NULL, '01793367227', '2024-07-03', 'Male', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1720013322-Boy.png', 'active', 'active', 1, '2024-07-03 07:28:42', '2024-07-03 07:28:42'),
(361, '461', NULL, '2024-07-04', 'Salman  farce  Araf', NULL, 'Sohel  Rana', NULL, '01714591785', 'Karima  Islam  Nizhum', NULL, '01771716008', NULL, '01771716008', '2024-07-04', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar,Pabna.', 'uploads/Student_img/1-1720106712-Boy.png', 'active', 'active', 1, '2024-07-04 09:25:12', '2024-07-04 09:25:12'),
(362, '462', NULL, '2024-07-04', 'Sanzida  Akter', NULL, 'Md. Jahangir  Hossain', NULL, '01734939163', 'Mst.Shali  Khatun', NULL, '01725868739', NULL, '01734939163', '2018-08-28', 'Female', NULL, 'Islam', NULL, NULL, 'Masum Bazar,Pabna.', 'Masum Bazar,Pabna.', 'uploads/Student_img/1-1720107183-Girl.png', 'active', 'active', 1, '2024-07-04 09:33:03', '2024-07-04 09:33:03'),
(363, '463', NULL, '2024-07-07', 'MUTASIM BILLAH', NULL, 'MD. MOSHIUR RAHMAN', NULL, '01711414538', 'RUMANA PERVEEN', NULL, '01714504572', NULL, '01711414538', '2017-11-11', 'Male', NULL, 'Islam', NULL, NULL, 'YOUTH TRAINING CENTER,PABNA', 'YOUTH TRAINING CENTER,PABNA', 'uploads/Student_img/1-1720362707-Boy.png', 'active', 'active', 1, '2024-07-07 08:31:47', '2024-07-07 08:31:47'),
(364, '464', NULL, '2024-07-07', 'Nandini Ghosh Eira', NULL, 'Neronjon Kumar', NULL, '01737273763', 'Ety rani', NULL, '01768678311', NULL, '01768678311', '2018-11-21', 'Female', NULL, 'Sonaton', NULL, NULL, 'Dilalpur,pabna', 'Dilalpur,pabna', 'uploads/Student_img/1-1720396386-dummy-woman-570x570.png', 'active', 'active', 1, '2024-07-07 17:53:06', '2024-07-07 17:53:06'),
(366, '466', NULL, '2024-07-10', 'Md. Emtiaz  Hasan', NULL, 'Md. Eftha  Khairul  Hasan', NULL, '01717042654', 'Mst. Sharmin  Khatun', NULL, '01780452238', NULL, '01717042654', '2018-12-22', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1720619340-Boy.png', 'active', 'active', 1, '2024-07-10 07:49:00', '2024-07-10 07:49:00'),
(367, '467', NULL, '2024-07-10', 'Ayat  Mallah', NULL, 'Md. Shakil  Mollah', NULL, '01781357149', 'Rubia  Parvin', NULL, '01743556439', NULL, '01781357149', '2019-08-17', 'Male', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1720619609-Boy.png', 'active', 'active', 1, '2024-07-10 07:53:29', '2024-07-10 07:53:29'),
(368, '468', NULL, '2024-07-10', 'Tayaba  Islam', NULL, 'Evon  Mollah', NULL, '01797589903', 'Mst.Shukhi  Khatun', NULL, '01730656831', NULL, '01730656831', '2020-05-18', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1720619798-Girl.png', 'active', 'active', 1, '2024-07-10 07:56:38', '2024-07-10 07:56:38'),
(369, '469', NULL, '2024-07-10', 'Md.Safir  Khan', NULL, 'Md. Sayem  Khan', NULL, '01714920452', 'Mst.Happy  Khatun', NULL, '01784016609', NULL, '01784016609', '2018-07-07', 'Male', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR , GHOSPARA ,PABNA', 'RAMCHANDRAPUR , GHOSPARA ,PABNA', 'uploads/Student_img/1-1720620074-Boy.png', 'active', 'active', 1, '2024-07-10 08:01:14', '2024-07-10 08:01:14'),
(370, '470', NULL, '2024-07-10', 'Sayada  Roza', NULL, 'Md. Rakibul  Islam', NULL, '01763018834', 'Shafali  Khatun', NULL, '01757031915', NULL, '01763018834', '2019-04-02', 'Female', NULL, 'Islam', NULL, NULL, 'Rajapur,Pabna.', 'Rajapur,Pabna.', 'uploads/Student_img/1-1720620484-Girl.png', 'active', 'active', 1, '2024-07-10 08:08:04', '2024-07-10 08:08:04'),
(371, '471', NULL, '2024-07-11', 'Md. Ardi  Munsi  Joy', NULL, 'Md.Abu Jafor  Munsi', NULL, '01716480947', 'Mst.Alpona  Munsi', NULL, '01314776606', NULL, '01716480947', '2018-09-25', 'Male', NULL, 'Islam', NULL, NULL, 'Shibram,Pabna.', 'Shibram,Pabna.', 'uploads/Student_img/1-1720708628-Boy.png', 'active', 'active', 1, '2024-07-11 08:37:08', '2024-07-11 08:39:31'),
(372, '472', NULL, '2024-07-11', 'Md.Ali Zayan', NULL, 'Md.Zia Uddin', NULL, '01303149524', 'Tanjiya  Ali', NULL, '01759255524', NULL, '01710003445', '2020-07-13', 'Male', NULL, 'Islam', NULL, NULL, 'Munibpur Dogachi,Pabna.', 'Munibpur Dogachi,Pabna.', 'uploads/Student_img/1-1720709046-Boy.png', 'active', 'active', 1, '2024-07-11 08:44:06', '2024-07-11 08:44:06'),
(373, '473', NULL, '2024-07-14', 'Ahamed Farhan  Uddin', NULL, 'Md.Ashraful  Bari', NULL, '01728698603', 'Mst.Armin  Sultana', NULL, '01316960966', NULL, '01728698603', '2024-07-14', 'Male', NULL, 'Islam', NULL, NULL, 'Laibary  Bazar,Atua,Pabna.', 'Laibary  Bazar,Atua,Pabna.', 'uploads/Student_img/1-1720972685-Boy.png', 'active', 'active', 1, '2024-07-14 09:58:05', '2024-07-14 09:58:05'),
(374, '474', NULL, '2024-07-14', 'Md.Ariyan  Afim', NULL, 'Md.Faruq  Hossin', NULL, '01773284605', 'Mst.Asha  Khatun', NULL, '01311793865', NULL, '01311793865', '2018-12-10', 'Male', NULL, 'Islam', NULL, NULL, 'Gobinda,Pabna.', 'Gobinda,Pabna.', 'uploads/Student_img/1-1720972876-Boy.png', 'active', 'active', 1, '2024-07-14 10:01:16', '2024-07-14 10:01:16'),
(375, '475', NULL, '2024-07-14', 'Jannatul  Ferdous', NULL, 'Md.Shohel  Rana', NULL, '01734898438', 'Rukshana  Aziz', NULL, '01611898438', NULL, '01710456289', '2018-06-05', 'Female', NULL, 'Islam', NULL, NULL, 'Kacharipara,Pabna.', 'Kacharipara,Pabna.', 'uploads/Student_img/1-1720973109-Girl.png', 'active', 'active', 1, '2024-07-14 10:05:09', '2024-07-14 10:05:09'),
(376, '476', NULL, '2024-07-14', 'Md.Rishan  Ali', NULL, 'Md.Altab  Hosen', NULL, '01719366398', 'Mst. Rasma  Khatun', NULL, '01703483828', NULL, '01719366398', '2017-07-28', 'Male', NULL, 'Islam', NULL, NULL, 'Meril  Bypass,Pabna.', 'Gosaipara,Ataikula,Pabna.', 'uploads/Student_img/1-1720973390-Boy.png', 'active', 'active', 1, '2024-07-14 10:09:50', '2024-07-14 10:09:50'),
(377, '477', NULL, '2024-07-16', 'Abir  Hasan  Riyan', NULL, 'Kamrul  Hasan', NULL, '01713715694', 'Mukta  Khatun', NULL, '01719036076', NULL, '01719036076', '2024-07-16', 'Male', NULL, 'Islam', NULL, NULL, 'South  Ragobbpur,Pabna.', 'South  Ragobbpur,Pabna.', 'uploads/Student_img/1-1721145577-Boy.png', 'active', 'active', 1, '2024-07-16 09:59:37', '2024-07-16 09:59:37'),
(378, '478', NULL, '2024-07-16', 'Ayesha  Inaaya', NULL, 'Al-Monsur', NULL, '01766206324', 'Resma  Khatun', NULL, '01766206324', NULL, '01766206324', '2021-05-17', 'Female', NULL, 'Islam', NULL, NULL, 'Abdul Hamid Road, Pabna.', 'Abdul Hamid Road, Pabna.', 'uploads/Student_img/1-1721145848-Girl.png', 'active', 'active', 1, '2024-07-16 10:04:08', '2024-07-16 10:04:08'),
(379, '479', NULL, '2024-07-25', 'Saiyoda  Marjiya  Tabassum', NULL, 'Md. Dulal  Hossain', NULL, '01744473614', 'Mukti  Khatun', NULL, '01307973905', NULL, '01744473614', '2024-07-25', 'Female', NULL, 'Islam', NULL, NULL, 'Komorpur,Pabna.', 'Komorpur,Pabna.', 'uploads/Student_img/1-1721928269-Girl.png', 'active', 'active', 1, '2024-07-25 11:24:29', '2024-07-25 11:24:29'),
(380, '480', NULL, '2024-07-25', 'Maidul  Islam  Muhn', NULL, 'Saiful  Islam', NULL, '01765394292', 'Mahfuja  Khatun', NULL, '01721561991', NULL, '01765394292', '2020-03-17', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Hemayetpur ,Pabna', 'uploads/Student_img/1-1721928479-Boy.png', 'active', 'active', 1, '2024-07-25 11:27:59', '2024-07-25 11:27:59'),
(381, '481', NULL, '2024-07-27', 'Umme Abiha', NULL, 'Md.Abu Hannan', NULL, '01712151875', 'Mst. Ayasha khatun', NULL, '01734217268', NULL, '01734217268', '2020-04-09', 'Female', NULL, 'ISLAM', NULL, NULL, 'DiLALPUR', 'jOYPUURHAT', 'uploads/Student_img/1-1722118562-2825253.png', 'active', 'active', 1, '2024-07-27 16:16:02', '2024-07-27 16:16:02'),
(382, '482', NULL, '2024-07-27', 'JANNATUL FERDOUSE ADEEBA', NULL, 'MD.AKRAM KHAN', NULL, '01741157459', 'MST.SHAIDA KHATUN', NULL, '01735064283', NULL, '01735064283', '2019-05-09', 'Female', NULL, 'ISLAM', NULL, NULL, 'SHOUTH RAMCHANDROPUR ,PABNA', 'SHOUTH RAMCHANDROPUR ,PABNA', 'uploads/Student_img/1-1722118902-2825253.png', 'active', 'active', 1, '2024-07-27 16:21:42', '2024-07-27 16:21:42'),
(383, '483', NULL, '2024-07-28', 'Tahsin  Tahiat  mehrin', NULL, 'Md.Ahsanul Kabir', NULL, '01721802804', 'Mst. Samsunnahar  sriti', NULL, '01704509140', NULL, '01721802804', '2024-07-28', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ragdubpur,Khan Bahadur road,Pabna.', 'South  Ragdubpur,Khan Bahadur road,Pabna.', 'uploads/Student_img/1-1722166377-Girl.png', 'active', 'active', 1, '2024-07-28 05:32:57', '2024-07-28 05:32:57'),
(384, '484', NULL, '2024-07-30', 'Nandini  Ghosh  Eira', NULL, 'Neronjon  Kumar  Ghosh', NULL, '01737273763', 'Ety Rani  Ghosh', NULL, '01768678311', NULL, '01768678311', '2024-07-30', 'Female', NULL, 'Hindu', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur ,Pabna', 'uploads/Student_img/1-1722348084-Girl.png', 'active', 'active', 1, '2024-07-30 08:01:24', '2024-07-30 08:01:24'),
(385, '485', NULL, '2024-08-04', 'Abdul  Ahad', NULL, 'Md. Amirul  Islam', NULL, '01761930098', 'Mst. Popy  Khatun', NULL, '01786523206', NULL, '01786523206', '2024-08-04', 'Male', NULL, 'Islam', NULL, NULL, 'Jafrabad, Puspopara,Pabna.', 'Jafrabad, Puspopara,Pabna.', 'uploads/Student_img/1-1722774851-Boy.png', 'active', 'active', 1, '2024-08-04 06:34:11', '2024-08-04 06:34:11'),
(386, '486', NULL, '2024-08-06', 'Tasfiya Jahan Tahheya', NULL, 'Pavel Hassan', NULL, '01732889927', 'Jakiya', NULL, '01726876336', NULL, '01726816336', '2017-09-19', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchor,Pabna', 'Dipchor,Pabna', 'uploads/Student_img/1-1722985415-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-06 17:03:35', '2024-08-06 17:03:35'),
(387, '487', NULL, '2024-08-06', 'Raiyan Hossan Tibro', NULL, 'Md. Mohirul PK', NULL, '01721747462', 'Sharmin Afroz', NULL, '01314586685', NULL, '01721747462', '2017-12-17', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchor,Pabna', 'Dipchor,Pabna', 'uploads/Student_img/1-1722985691-2422548.png', 'active', 'active', 1, '2024-08-06 17:08:11', '2024-08-06 17:08:11'),
(388, '488', NULL, '2024-08-06', 'Fariya  Islam', NULL, 'Rofiq', NULL, '01787046161', 'Sharmin Aktar Mim', NULL, '01712111382', NULL, '01712111382', '2019-02-11', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchor,Pabna', 'Dipchor,Pabna', 'uploads/Student_img/1-1722985923-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-06 17:12:03', '2024-08-06 17:12:03'),
(389, '489', NULL, '2024-08-14', 'Tanbin Hasan Jubaid', NULL, 'Md.Shamim kazi', NULL, '01314851604', 'Mst.Lakhi Khstun', NULL, '01721775395', NULL, '01721775395', '2016-12-26', 'Male', NULL, 'Islam', NULL, NULL, 'Radhakntopur', 'Radhakntopur', 'uploads/Student_img/1-1723646185-2422548.png', 'active', 'active', 1, '2024-08-14 08:36:25', '2024-08-14 08:36:25'),
(390, '490', NULL, '2024-08-14', 'Mursalin Biswas', NULL, 'Ajadur Rahman', NULL, 'N/A', 'Farjana yesmin', NULL, '01712314982', NULL, '01712314982', '2017-05-24', 'Male', NULL, 'Islam', NULL, NULL, 'Zela para,Pabna', 'Zela para,Pabna', 'uploads/Student_img/1-1723646623-2422548.png', 'active', 'active', 1, '2024-08-14 08:43:43', '2024-08-14 08:43:43'),
(391, '491', NULL, '2024-08-14', 'Mis.Jannatul Ferdaus', NULL, 'Md.Saiful Islan', NULL, '01734106123', 'Mis. Borna', NULL, '01790775132', NULL, '01734106123', '2019-04-21', 'Female', NULL, 'Islam', NULL, NULL, 'Chorkushakhali,pabna', 'Chorkushakhali,pabna', 'uploads/Student_img/1-1723646965-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-14 08:49:25', '2024-08-14 08:49:25'),
(393, '493', NULL, '2024-08-14', 'Mst.Ridwana Rayhan', NULL, 'Md. Abu Rayhun', NULL, '01711066876', 'Shormin Aktar', NULL, '01712480863', NULL, '01712480863', '2019-01-01', 'Female', NULL, 'Islam', NULL, NULL, 'Ramchandropur,pabna', 'Ramchandropur,pabna', 'uploads/Student_img/1-1723647573-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-14 08:59:33', '2024-08-14 08:59:33'),
(394, '494', NULL, '2024-08-14', 'Md. Sabaz Kabir Hossain', NULL, 'Md. Kamal  Hossain', NULL, '01745450004', 'Mst.Rulia', NULL, '01738342822', NULL, '01738342822', '2023-09-14', 'Male', NULL, 'Islam', NULL, NULL, 'Bokorampur, pabna', 'Bokorampur, pabna', 'uploads/Student_img/1-1723647951-2422548.png', 'active', 'active', 1, '2024-08-14 09:05:51', '2024-08-14 09:05:51'),
(395, '495', NULL, '2024-08-14', 'Md. Abrar Fahad', NULL, 'Md.Aminul Islam', NULL, '01710708725', 'Most. Muslima Khatun', NULL, '01793915124', NULL, '01710708725', '2019-01-17', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar, pabna', 'Dipchar, pabna', 'uploads/Student_img/1-1723648247-2422548.png', 'active', 'active', 1, '2024-08-14 09:10:47', '2024-08-14 09:10:47'),
(396, '496', NULL, '2024-08-14', 'Raisa Siddika', NULL, 'Md.Ataur Rahman', NULL, '01721221400', 'Sammi Saleha', NULL, '01302491803', NULL, '01302491803', '2019-02-18', 'Female', NULL, 'Islam', NULL, NULL, 'Dublia, pabna', 'Dublia, pabna', 'uploads/Student_img/1-1723648481-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-14 09:14:41', '2024-08-14 09:14:41'),
(398, '498', NULL, '2024-08-14', 'Shamon Islam Alamin', NULL, 'Shahadat  Islam', NULL, '01983055062', 'Sheema Akther', NULL, '01983055062', NULL, '01983055062', '2019-05-05', 'Male', NULL, 'Islam', NULL, NULL, 'Dokkhin Raghobpur,  pabna', 'Dokkhin Raghobpur,  pabna', 'uploads/Student_img/1-1723649912-2422548.png', 'active', 'active', 1, '2024-08-14 09:38:32', '2024-08-14 09:38:32'),
(399, '499', NULL, '2024-08-14', 'Anabia Rahman', NULL, 'Md. Anisur Rahman', NULL, '01711585985', 'Ayesha Khatun', NULL, '01710864979', NULL, '01710864979', '2018-04-12', 'Female', NULL, 'Islam', NULL, NULL, 'Arifpur,pabna', 'Arifpur,pabna', 'uploads/Student_img/1-1723650187-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-14 09:43:07', '2024-08-14 09:43:07'),
(400, '500', NULL, '2024-08-14', 'Husaib shek safin', NULL, 'Masum shek', NULL, '017941774884', 'Sohani pervin', NULL, '01782044672', NULL, '01782044672', '2018-11-11', 'Male', NULL, 'Islam', NULL, NULL, 'Ramchandhopur, Pabna', 'Ramchandhopur, Pabna', 'uploads/Student_img/1-1723650479-2422548.png', 'active', 'active', 1, '2024-08-14 09:47:59', '2024-08-14 09:47:59'),
(401, '501', NULL, '2024-08-14', 'Md. Safoan Rahman', NULL, 'Md. Salimur Rahman', NULL, '01716163920', 'Mis. Samima Akter', NULL, '01741505585', NULL, '01716163920', '2018-08-25', 'Male', NULL, 'Islam', NULL, NULL, 'Ramchandropur,pabna', 'Ramchandropur,pabna', 'uploads/Student_img/1-1723650876-2422548.png', 'active', 'active', 1, '2024-08-14 09:54:36', '2024-08-14 09:54:36'),
(402, '502', NULL, '2024-08-19', 'Noman Ahamed', NULL, 'Md.kawsar Hossen', NULL, '01725767880', 'Miss. Monira Akter', NULL, '01771630530', NULL, '01771630530', '2020-05-15', 'Male', NULL, 'Islam', NULL, NULL, 'Shadhupara,  pabna', 'Shadhupara,  pabna', 'uploads/Student_img/1-1724080992-2422548.png', 'active', 'active', 1, '2024-08-19 09:23:12', '2024-08-19 09:23:12'),
(403, '503', NULL, '2024-08-19', 'Md. Rafiuzzaman', NULL, 'Md. Moniruzzaman', NULL, '017331585782', 'Most. Sirajum Monera', NULL, '01799008101', NULL, '01799008101', '2017-06-01', 'Male', NULL, 'Islam', NULL, NULL, 'Arifpur,  Pabna', 'Arifpur,  Pabna', 'uploads/Student_img/1-1724081317-2422548.png', 'active', 'active', 1, '2024-08-19 09:28:37', '2024-08-19 09:28:37'),
(405, '505', NULL, '2024-08-20', 'Nusrat Jahan Nisheta Nahar', NULL, 'Md. Noyon', NULL, '01719253339', 'Halimatuj', NULL, '01312253339', NULL, '01312253339', '2017-05-19', 'Female', NULL, 'Islam', NULL, NULL, 'South Raghobpur, pabna', 'South Raghobpur, pabna', 'uploads/Student_img/1-1724151062-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-20 04:51:02', '2024-08-20 04:51:02'),
(406, '506', NULL, '2024-08-20', 'Alishba Islam', NULL, 'Ashraful Islam', NULL, '01767498527', 'Ismoth Ara puspo', NULL, '01863722155', NULL, '01863722155', '2021-12-20', 'Female', NULL, 'Islam', NULL, NULL, 'Munsurabad,  pabna', 'Munsurabad,  pabna', 'uploads/Student_img/1-1724151554-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-20 04:59:14', '2024-08-20 04:59:14'),
(407, '507', NULL, '2024-08-21', 'Suraiya Akter  Megla', NULL, 'Md. Shaheen  Alam', NULL, '01305776650', 'Mst. Sopna Akter', NULL, '01305776650', NULL, '01305776650', '2019-05-15', 'Female', NULL, 'Islam', NULL, NULL, 'Dipchar, Pabna', 'Dipchar, Pabna', 'uploads/Student_img/1-1724237180-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-21 04:46:20', '2024-08-21 04:46:20'),
(408, '508', NULL, '2024-08-21', 'Shazini Haque', NULL, 'Shariful Haque', NULL, '01731373697', 'Umme Habiba', NULL, '01725208197', NULL, '01731373697', '2019-06-14', 'Female', NULL, 'Islam', NULL, NULL, 'Bolorampur, Pabna', 'Bolorampur, Pabna', 'uploads/Student_img/1-1724237838-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-21 04:57:18', '2024-08-21 04:57:18'),
(411, '511', NULL, '2024-08-31', 'Abdullah Al Nashwan', NULL, 'Meraj Muatakim', NULL, '01715134643', 'Neena shahriar', NULL, '01798402929', NULL, '01715134643', '2019-12-09', 'Male', NULL, 'Islam', NULL, NULL, 'Golam kader golo, pabna', 'Golam kader golo, pabna', 'uploads/Student_img/1-1725141953-2422548.png', 'active', 'active', 1, '2024-08-31 16:05:53', '2024-08-31 16:05:53'),
(412, '512', NULL, '2024-08-31', 'Tausif Abdullah Ibne Rahman', NULL, 'Md.Mizanur Rahman', NULL, '01716541950', 'Sharmin Aktar', NULL, '01717442908', NULL, '01717442908', '2020-11-23', 'Male', NULL, 'Islam', NULL, NULL, 'South Raghobpur, pabna', 'South Raghobpur, pabna', 'uploads/Student_img/1-1725142580-2422548.png', 'active', 'active', 1, '2024-08-31 16:16:20', '2024-08-31 16:16:20'),
(416, '516', NULL, '2024-08-31', 'Samiha Ahmed', NULL, 'Sharif Ahmed', NULL, '01718577110', 'Aunun Nahar', NULL, '01745171858', NULL, '01745171858', '2020-04-27', 'Female', NULL, 'Islam', NULL, NULL, 'Pabna', 'Pabna', 'uploads/Student_img/1-1725143789-dummy-woman-570x570.png', 'active', 'active', 1, '2024-08-31 16:36:29', '2024-08-31 16:36:29'),
(418, '518', '2024-09-02', '2024-09-02', 'Tawsif  Islam  Prachurjo', NULL, 'Tawhidul  Islam', NULL, '01718219414', 'Salena  Sultana', NULL, '01789920127', NULL, '01718279414', '2018-09-26', 'Male', NULL, 'Islam', NULL, NULL, 'Shalgaria, Pabna.', 'Shalgaria,Pabna', 'uploads/Student_img/1-1725262720-Boy.png', 'active', 'active', 1, '2024-09-02 01:38:40', '2024-09-02 01:38:40'),
(419, '519', NULL, '2024-09-02', 'Nur  nisha', NULL, 'Md. Baccu  Pramanik', NULL, '01326501720', 'Mst.Shraboni  Khatun', NULL, '01326501720', NULL, '01326501720', '2016-10-21', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1725263036-Girl.png', 'active', 'active', 1, '2024-09-02 01:43:56', '2024-09-02 01:43:56'),
(420, '520', NULL, '2024-09-02', 'Md. Amir  Hamza  Khan', NULL, 'Md.Abdus  Sabur  Khan', NULL, '01749155117', 'Mst.Hafiza  Khatun', NULL, '01710725564', NULL, '01749155117', '2017-07-03', 'Male', NULL, 'Islam', NULL, NULL, 'Dipchar,Pabna.', 'Dipchar, Pabna.', 'uploads/Student_img/1-1725263460-Boy.png', 'active', 'active', 1, '2024-09-02 01:51:00', '2024-09-02 01:51:00');
INSERT INTO `students` (`id`, `student_id`, `admission_no`, `admission_date`, `student_name`, `bangla_name`, `father_name`, `father_nid`, `father_mobile`, `mother_name`, `mother_nid`, `mother_mobile`, `guardian_name`, `guardian_mobile`, `dob`, `gender`, `blood_group`, `religion`, `email`, `student_bc`, `present_address`, `permanent_address`, `img_url`, `sms_status`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(422, '522', NULL, '2024-09-02', 'Samiul  Islam  Naim', NULL, 'Robiul  Islam', NULL, '01790615537', 'Shma  Khatun', NULL, '01790615537', NULL, '01790615537', '2017-12-09', 'Male', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1725264020-Boy.png', 'active', 'active', 1, '2024-09-02 02:00:20', '2024-09-02 02:00:20'),
(424, '524', NULL, '2024-10-06', 'MST. MARIOM AKTER MYSHA', NULL, 'MD. MONOUR HOSSAIN', NULL, '0171740787', 'MST. HOSNARA', NULL, '01761901672', NULL, '01761901672', '2017-08-02', 'Female', NULL, 'Islam', NULL, NULL, 'DIPCHAR,PABNA', 'DIPCHAR,PABNA', 'uploads/Student_img/1-1728186490-Girl.png', 'active', 'active', 1, '2024-10-05 21:48:10', '2024-10-05 21:48:10'),
(426, '526', NULL, '2025-01-21', 'NUR RAIYAN ISLAM MEJBA', NULL, 'MOMINUL ISLAM', NULL, '01712717738', 'RUKAIYA ISLAM', NULL, '017180222589', NULL, '01712717738', '2020-05-25', 'Male', NULL, 'Islam', NULL, NULL, 'KISNOPUR PABNA', 'KISNOPUR PABNA', 'uploads/Student_img/1-1737429750-Boy.png', 'active', 'active', 1, '2025-01-21 03:22:30', '2025-01-21 03:22:30'),
(427, '527', NULL, '2025-01-21', 'RIZWANUL ISLAM HABIB', NULL, 'MD. RAFIQUL ISLAM', NULL, '01717744772', 'UMMEH TABASSUM', NULL, '01946935331', NULL, '01946935331', '2025-01-18', 'Male', NULL, 'Islam', NULL, NULL, 'VOIJORA BAGERHAT', 'VOIJORA BAGERHAT', 'uploads/Student_img/1-1737436566-Boy.png', 'active', 'active', 1, '2025-01-21 05:16:06', '2025-01-21 05:16:06'),
(428, '528', NULL, '2025-01-21', 'RAISUL ISLAM LABIB', NULL, 'MD. RAFIQUL ISLAM', NULL, '01717744772', 'UMMEH TABASSUM', NULL, '01946935331', NULL, '01946935331', '2025-01-30', 'Male', NULL, 'Islam', NULL, NULL, 'VOIJORA BAGERHAT', 'VOIJORA BAGERHAT', 'uploads/Student_img/1-1737436790-Boy.png', 'active', 'active', 1, '2025-01-21 05:19:50', '2025-01-21 05:19:50'),
(431, '531', NULL, '2025-01-21', 'NAVIYA NUR SABA', NULL, 'MD. NAYEB ALI', NULL, '01746267665', 'JANNATUL FERDOUS', NULL, '01721976890', NULL, '01746267665', '2020-10-27', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR', 'SOUTH RAGHOBPUR', 'uploads/Student_img/1-1737440374-Girl.png', 'active', 'active', 1, '2025-01-21 06:19:34', '2025-01-21 06:19:34'),
(432, '532', NULL, '2025-01-21', 'TAJKIYA TASNEEM', NULL, 'MD. ABDUL  ALIM', NULL, '01722162323', 'SHAMIMA NASRIN', NULL, '01798183818', NULL, '01798183818', '2020-11-08', 'Female', NULL, 'ISLAM', NULL, NULL, 'MANIKHAT SHUJANAGAR', 'MANIKHAT SHUJANAGAR', 'uploads/Student_img/1-1737442566-Girl.png', 'active', 'active', 1, '2025-01-21 06:56:06', '2025-01-21 06:56:06'),
(433, '533', NULL, '2025-01-21', 'ABRAROHI KHAN', NULL, 'SHAMIMUL ISLAM', NULL, 'N/A', 'MST. ARJINA KHATUN', NULL, '01961625918', NULL, '01961625918', '2021-09-03', 'Male', NULL, 'Islam', NULL, NULL, 'MOHISHER DIPU ,PABNA', 'MOHISHER DIPU ,PABNA', 'uploads/Student_img/1-1737443208-Boy.png', 'active', 'active', 1, '2025-01-21 07:06:48', '2025-01-21 07:06:48'),
(434, '534', NULL, '2025-01-21', 'HUMAIRA JANNAT SPORSHI', NULL, 'MD. ATIKUL ISLAM SUMON', NULL, '01303026294', 'MORIUM JAMILA', NULL, '01789105051', NULL, '01789105051', '2020-11-01', 'Female', NULL, 'Islam', NULL, NULL, 'SHOUTH RAGHOBPUR ,PABNA', 'SHOUTH RAGHOBPUR ,PABNA', 'uploads/Student_img/1-1737443647-Girl.png', 'active', 'active', 1, '2025-01-21 07:14:07', '2025-01-21 07:14:07'),
(435, '535', NULL, '2025-01-21', 'ABRAR FAHAD', NULL, 'MD. ETTADUL ISLAM', NULL, '01765769891', 'KHADIJA KHATUN', NULL, '01882549367', NULL, '01765769891', '2019-10-22', 'Male', NULL, 'Islam', NULL, NULL, 'CHORGOUSPUR , HEMAYAT PUR, PABNA', 'CHORGOUSPUR , HEMAYAT PUR, PABNA', 'uploads/Student_img/1-1737443975-Boy.png', 'active', 'active', 1, '2025-01-21 07:19:35', '2025-01-21 07:19:35'),
(436, '536', NULL, '2025-01-21', 'HUAYRA MAHBUBA', NULL, 'MD. ALAM SARDAR', NULL, '01716544306', 'MST .RIPA KHATUN', NULL, '01838149541', NULL, '01838149541', '2019-12-19', 'Female', NULL, 'Islam', NULL, NULL, 'DIPCHAR ,PABNA', 'DIPCHAR ,PABNA', 'uploads/Student_img/1-1737444662-Girl.png', 'active', 'active', 1, '2025-01-21 07:31:02', '2025-01-21 07:31:02'),
(437, '537', NULL, '2025-01-21', 'TASNIM AKTER', NULL, 'MD TARIKUL ISLAM', NULL, '01739413820', 'MST TAHAMINA AKTER MINA', NULL, '01761559710', NULL, '01739413820', '2021-01-10', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1737445081-Girl.png', 'active', 'active', 1, '2025-01-21 07:38:01', '2025-01-21 07:38:01'),
(439, '539', NULL, '2025-01-21', 'SANZIDA JAHAN TANHA', NULL, 'MEHADI HASAN', NULL, '01717774686', 'N/A', NULL, '01781942419', NULL, '01717774686', '2019-07-17', 'Female', NULL, 'Islam', NULL, NULL, 'GOBINDA', 'GOBINDA', 'uploads/Student_img/1-1737446207-Girl.png', 'active', 'active', 1, '2025-01-21 07:56:47', '2025-01-21 07:56:47'),
(440, '540', NULL, '2025-01-21', 'ALISHBA AHAMED NAZIAT', NULL, 'MD . KOUSHIK AHAMED', NULL, '01750860548', 'MUSLIMA KHATUN', NULL, '01784927378', NULL, '01784927378', '2021-11-21', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur,Pabna.', 'uploads/Student_img/1-1737446719-Girl.png', 'active', 'active', 1, '2025-01-21 08:05:19', '2025-01-21 08:05:19'),
(441, '541', NULL, '2025-01-21', 'JANNATUL FERDOUS ROZA', NULL, 'MD. SOHEL RANA', NULL, '01324461369', 'MST. PARVIN  KHATUN', NULL, '01324461369', NULL, '01324461369', '2019-12-30', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1737447072-Girl.png', 'active', 'active', 1, '2025-01-21 08:11:12', '2025-01-21 08:11:12'),
(442, '542', NULL, '2025-01-22', 'MD. ARIYAN NAGIB', NULL, 'MD. NUSUZZAMAN', NULL, '01717330314', 'MST. LIMA PARVIN', NULL, '01796734657', NULL, '01717330314', '2019-03-30', 'Male', NULL, 'Islam', NULL, NULL, 'MASUMBAZAR ,PABNA', 'MASUMBAZAR ,PABNA', 'uploads/Student_img/1-1737513996-Boy.png', 'active', 'active', 1, '2025-01-21 20:46:36', '2025-01-21 20:46:36'),
(444, '544', NULL, '2025-01-22', 'M.S. TASFIYA AFRIN', NULL, 'MD. SANOAR HOSSEN', NULL, '01705483195', 'NISHAT SULTANA', NULL, '01303340244', NULL, '01303340244', '2020-05-24', 'Male', NULL, 'Islam', NULL, NULL, 'GOAR BANGLA ROAD ,PABNA', 'GOAR BANGLA ROAD ,PABNA', 'uploads/Student_img/1-1737514630-Boy.png', 'active', 'active', 1, '2025-01-21 20:57:10', '2025-01-21 20:57:10'),
(445, '545', NULL, '2025-01-22', 'ARFAN MISKAT', NULL, 'HASANUR RAHAMAN', NULL, '01744949909', 'MURSALAT JAKOAT', NULL, '01754328518', NULL, '01754328518', '2020-11-20', 'Male', NULL, 'Islam', NULL, NULL, 'TALPUQUR ,PABNA', 'TALPUQUR ,PABNA', 'uploads/Student_img/1-1737516253-Boy.png', 'active', 'active', 1, '2025-01-21 21:24:13', '2025-01-21 21:24:13'),
(448, '548', NULL, '2025-01-22', 'ABRAR  FAHAD EAMIN', NULL, 'MD. EKRAM HOSSIN', NULL, '01728997501', 'MST KHADIJA AKTER ESHA', NULL, '01735700110', NULL, '01735700110', '2020-06-07', 'Male', NULL, 'Islam', NULL, NULL, 'DIPCHAR ,PABNA', 'DIPCHAR ,PABNA', 'uploads/Student_img/1-1737525456-Boy.png', 'active', 'active', 1, '2025-01-21 23:57:36', '2025-01-21 23:57:36'),
(449, '549', NULL, '2025-01-22', 'ABDUL RAHIM', NULL, 'MD. BABUL KAOSAR', NULL, '01725601050', 'SHARMIN AKTER', NULL, 'N/A', NULL, '01725601050', '2021-11-03', 'Male', NULL, 'Islam', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1737525855-Boy.png', 'active', 'active', 1, '2025-01-22 00:04:15', '2025-01-22 00:04:15'),
(450, '550', NULL, '2025-01-22', 'ANIKA RAHMAN', NULL, 'MD. ANIFUR RAHMAN', NULL, '018940001', 'FATHEMA AKTER', NULL, '01894740002', NULL, '01894740002', '2020-01-05', 'Female', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur,Pabna.', 'uploads/Student_img/1-1737526250-Girl.png', 'active', 'active', 1, '2025-01-22 00:10:50', '2025-01-22 00:10:50'),
(451, '551', NULL, '2025-01-22', 'RAIYAN RAHMAN NAHAB', NULL, 'MD. ANIFUR RAHMAN', NULL, '01894740001', 'FATHEMA AKTER', NULL, '018940002', NULL, '01894740002', '2016-04-04', 'Male', NULL, 'Islam', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur,Pabna.', 'uploads/Student_img/1-1737526809-Boy.png', 'active', 'active', 1, '2025-01-22 00:20:09', '2025-01-22 00:20:09'),
(452, '552', NULL, '2025-01-22', 'SABIHA SAZZAT ROZA', NULL, 'MD SAZZAD HOSSAIN', NULL, '013133354553', 'MST SUMI KHATUN', NULL, '01751210154', NULL, '01751210154', '2020-05-08', 'Female', NULL, 'Islam', NULL, NULL, 'KALACHADPARA ,PABNA', 'KALACHADPARA ,PABNA', 'uploads/Student_img/1-1737527058-Girl.png', 'active', 'active', 1, '2025-01-22 00:24:18', '2025-01-22 00:24:18'),
(453, '553', NULL, '2025-01-22', 'AHNAF ZABIR', NULL, 'MD. ZAHID HASAN', NULL, '01773104118', 'ASHURA KHATUN', NULL, '01762390904', NULL, '01773104118', '2021-08-19', 'Male', NULL, 'Islam', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1737527361-Boy.png', 'active', 'active', 1, '2025-01-22 00:29:21', '2025-01-22 00:29:21'),
(454, '554', NULL, '2025-01-22', 'YUSHA SAFIAT ZIANA', NULL, 'ABU YUSUF JISAN', NULL, '01302236991', 'ASMANI ISLAM', NULL, '01307079696', NULL, '01307079696', '2019-12-30', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737527602-Girl.png', 'active', 'active', 1, '2025-01-22 00:33:22', '2025-01-22 00:33:22'),
(455, '555', NULL, '2025-01-22', 'MEHENAZ AZBAH', NULL, 'MD. ATIKKUR RAHMAN', NULL, '0171680239', 'AKHINUR ISLAM', NULL, '01704587276', NULL, '01704587276', '2021-03-03', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1737527888-Girl.png', 'active', 'active', 1, '2025-01-22 00:38:08', '2025-01-22 00:38:08'),
(457, '557', NULL, '2025-01-22', 'SHAKH  SALMAN', NULL, 'SAIFUL ISLAM', NULL, '+6582861502', 'MST  BLIST KHATUN', NULL, '01303422943', NULL, '01303422943', '2021-04-18', 'Male', NULL, 'Islam', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1737530592-Boy.png', 'active', 'active', 1, '2025-01-22 01:23:12', '2025-01-22 01:23:12'),
(458, '558', NULL, '2025-01-22', 'MEHARIMA CHOWDHURY MAHJABIN', NULL, 'M.G.LIKHON CHOWDHURY', NULL, '01306222470', 'MODINA CHOWDHURI', NULL, '01306222470', NULL, '01306222470', '2021-05-23', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737530866-Girl.png', 'active', 'active', 1, '2025-01-22 01:27:46', '2025-01-22 01:27:46'),
(459, '559', NULL, '2025-01-22', 'FAATIHA AYAT ROJA', NULL, 'MAHABUB ALAM', NULL, '01603901021', 'MST MONIRA KHATUN', NULL, '01756008121', NULL, '01756008121', '2020-12-29', 'Female', NULL, 'Islam', NULL, NULL, 'DOGACHI , PABNA', 'DOGACHI , PABNA', 'uploads/Student_img/1-1737531322-Girl.png', 'active', 'active', 1, '2025-01-22 01:35:22', '2025-01-22 01:35:22'),
(460, '560', NULL, '2025-01-22', 'JISAN BIN JAHID', NULL, 'MD. JAHID BIN IBNE REAZ', NULL, '01719361753', 'SHEARMIN', NULL, '01781339949', NULL, '01719361753', '2017-04-09', 'Male', NULL, 'Islam', NULL, NULL, 'KACARIPARA,PABNA', 'KACARIPARA,PABNA', 'uploads/Student_img/1-1737531827-Boy.png', 'active', 'active', 1, '2025-01-22 01:43:47', '2025-01-22 01:43:47'),
(461, '561', NULL, '2025-01-22', 'ALI  AZGHAR SAFAN', NULL, 'MD MUKUL HOSSAIN', NULL, '01728770939', 'MST RESHMA PARVIN', NULL, '01734345676', NULL, '01734345676', '2018-10-20', 'Male', NULL, 'Islam', NULL, NULL, 'SUJANAGAR ,PABNA', 'SUJANAGAR ,PABNA', 'uploads/Student_img/1-1737532257-Boy.png', 'active', 'active', 1, '2025-01-22 01:50:57', '2025-01-22 01:50:57'),
(462, '562', NULL, '2025-01-22', 'RUBITA FATIMA KHAN', NULL, 'ROWSON ALAM KHAN', NULL, '01713580167', 'MST. SHERMIN SHANAZ', NULL, '01765707172', NULL, '01765707172', '2019-05-28', 'Female', NULL, 'Islam', NULL, NULL, 'MOHISHER DIPU ,PABNA', 'MOHISHER DIPU ,PABNA', 'uploads/Student_img/1-1737532611-Girl.png', 'active', 'active', 1, '2025-01-22 01:56:51', '2025-01-22 01:56:51'),
(463, '563', NULL, '2025-01-22', 'NAYEM ISLAM', NULL, 'NADIM HOSSAIN', NULL, '01300716363', 'SALMA KHATUN', NULL, 'N/A', NULL, '01300716363', '2020-07-27', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737532932-Boy.png', 'active', 'active', 1, '2025-01-22 02:02:12', '2025-01-22 02:02:12'),
(464, '564', NULL, '2025-01-23', 'MD. SAMIUL ISLAM', NULL, 'MD. SHANIM HOSAIN', NULL, '01711417828', 'MST. AMINA AKTER', NULL, '01703486086', NULL, '01711417828', '2020-10-20', 'Male', NULL, 'Islam', NULL, NULL, 'KULONIA PABNA', 'KULONIA PABNA', 'uploads/Student_img/1-1737600251-Boy.png', 'active', 'active', 1, '2025-01-22 20:44:11', '2025-01-22 20:44:11'),
(465, '565', NULL, '2025-01-23', 'MORMI MONOMITA', NULL, 'MD. MASUD PARVEZ', NULL, '01713860645', 'MST. SHAHNAZ FERDOUS', NULL, '01758997869', NULL, '01758997869', '2020-08-22', 'Female', NULL, 'Islam', NULL, NULL, 'TOWNHALL PARA, PABNA', 'TOWNHALL PARA, PABNA', 'uploads/Student_img/1-1737601147-Girl.png', 'active', 'active', 1, '2025-01-22 20:59:07', '2025-01-22 20:59:07'),
(466, '566', NULL, '2025-01-23', 'AYAAN RAHMAN', NULL, 'MD. SUMON UR RAHMAN', NULL, '01722585877', 'MST . SHOMPA KHATUN', NULL, '01710753236', NULL, '01722585877', '2015-10-15', 'Male', NULL, 'Islam', NULL, NULL, 'KALACHAD PARA,PABNA', 'KALACHAD PARA,PABNA', 'uploads/Student_img/1-1737601361-Boy.png', 'active', 'active', 1, '2025-01-22 21:02:41', '2025-01-22 21:02:41'),
(467, '567', NULL, '2025-01-23', 'AFIYA RAHMAN', NULL, 'SAYDUR RAHMAN', NULL, '01727179095', 'NAZMIN PERVIN', NULL, '01773708057', NULL, '01773708057', '2021-03-23', 'Female', NULL, 'Islam', NULL, NULL, 'SHADHUPARA,PABNA', 'SHADHUPARA,PABNA', 'uploads/Student_img/1-1737601546-Girl.png', 'active', 'active', 1, '2025-01-22 21:05:46', '2025-01-22 21:05:46'),
(469, '569', NULL, '2025-01-23', 'KM RAFSAN', NULL, 'MD. ATAUR RAHMAN', NULL, '01716437258', 'MST. DILRUBA KHANAM', NULL, '01749864598', NULL, '01716437258', '2024-01-24', 'Male', NULL, 'Islam', NULL, NULL, 'PUSPOPARA,PABNA', 'PUSPOPARA,PABNA', 'uploads/Student_img/1-1737602012-Boy.png', 'active', 'active', 1, '2025-01-22 21:13:32', '2025-01-22 21:13:32'),
(471, '571', NULL, '2025-01-23', 'AHON AKKA', NULL, 'SAMLAL ECCA', NULL, '01776899501', 'MINOTI BASKEY', NULL, '01770887021', NULL, '01776899501', '2020-11-21', 'Male', NULL, 'HINDU', NULL, NULL, 'Dilalpur,Pabna.', 'Dilalpur,Pabna.', 'uploads/Student_img/1-1737602576-Boy.png', 'active', 'active', 1, '2025-01-22 21:22:56', '2025-01-22 21:22:56'),
(472, '572', NULL, '2025-01-23', 'AHAMMAD AL MUKTADIR', NULL, 'MD. MAMUN ALL GAUSH', NULL, '01732023339', 'MITHILA FARZANA', NULL, '01300543000', NULL, '01300543000', '2020-07-23', 'Male', NULL, 'Islam', NULL, NULL, 'LASKPUR BYPASS BYLANE, PABNA', 'LASKPUR BYPASS BYLANE, PABNA', 'uploads/Student_img/1-1737602932-Boy.png', 'active', 'active', 1, '2025-01-22 21:28:52', '2025-01-22 21:28:52'),
(473, '573', NULL, '2025-01-23', 'ISRAT ZAHAN ORIN', NULL, 'MD. WASIM MOLLA', NULL, '01979231382', 'BEAUTY KHATUN', NULL, '01892712297', NULL, '01892712297', '2019-10-31', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTHRAGHOBPUR,PABNA', 'SOUTHRAGHOBPUR,PABNA', 'uploads/Student_img/1-1737612634-Girl.png', 'active', 'active', 1, '2025-01-23 00:10:34', '2025-01-23 00:10:34'),
(475, '575', NULL, '2025-01-23', 'SINTAHA JARA', NULL, 'MD. JAMIL HOSSAIN', NULL, '01757019148', 'SETU KHATUN', NULL, '01314412159', NULL, '01314412159', '2018-07-19', 'Female', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1737613676-Girl.png', 'active', 'active', 1, '2025-01-23 00:27:56', '2025-01-23 00:27:56'),
(476, '576', NULL, '2025-01-23', 'ARISHA FIRDOUS ENAYA', NULL, 'MOHAMMAD ABDUL KAIUM', NULL, '01754459900', 'TAZINUR AKHTAR', NULL, '01754119726', NULL, '01754119726', '2020-07-06', 'Female', NULL, 'Islam', NULL, NULL, 'KACHARIPARA,PABNA', 'KACHARIPARA,PABNA', 'uploads/Student_img/1-1737614209-Girl.png', 'active', 'active', 1, '2025-01-23 00:36:49', '2025-01-23 00:36:49'),
(477, '577', NULL, '2025-01-23', 'SAMREEN SAWDA', NULL, 'MD.SADDAM HOSSAIN', NULL, '01719900091', 'SADIA AFRIN', NULL, '01764008004', NULL, '01764008004', '2019-05-10', 'Female', NULL, 'Islam', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1737614469-Girl.png', 'active', 'active', 1, '2025-01-23 00:41:09', '2025-01-23 00:41:09'),
(478, '578', NULL, '2025-01-23', 'TABASUM FARIA', NULL, 'MD. FEROZ UDDIN PRAMNIK', NULL, '01717830953', 'MORIAM KHATUN', NULL, '01766803180', NULL, '01766803180', '2020-02-04', 'Female', NULL, 'Islam', NULL, NULL, 'KOLADI ,PABNA', 'KOLADI ,PABNA', 'uploads/Student_img/1-1737614688-Girl.png', 'active', 'active', 1, '2025-01-23 00:44:48', '2025-01-23 00:44:48'),
(479, '579', NULL, '2025-01-23', 'ABDUR RAHMAN', NULL, 'MD.GOLAM MOSTOFA', NULL, 'N/A', 'JANNATUL NAHAR', NULL, '01725002353', NULL, '01725002353', '2019-12-31', 'Male', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1737614985-Boy.png', 'active', 'active', 1, '2025-01-23 00:49:45', '2025-01-23 00:49:45'),
(480, '580', NULL, '2025-01-23', 'EHSANUR ANAS', NULL, 'ABDUL MALEK', NULL, '01710085960', 'JANNATUL FERDOUS', NULL, '01722895575', NULL, '01722895575', '2020-09-25', 'Male', NULL, 'Islam', NULL, NULL, 'RAMCHANDRAPUR, PABNA', 'RAMCHANDRAPUR, PABNA', 'uploads/Student_img/1-1737615245-Boy.png', 'active', 'active', 1, '2025-01-23 00:54:05', '2025-01-23 00:54:05'),
(481, '581', NULL, '2025-01-23', 'TAHRIM FAIZA OTHOY', NULL, 'MD. TUHIDUL ISLAM', NULL, '01797256805', 'MOST. SURMA AKTER', NULL, '01797256805', NULL, '01797256805', '2020-01-09', 'Female', NULL, 'Islam', NULL, NULL, 'KULONIA DOGACHI,PABNA', 'KULONIA DOGACHI,PABNA', 'uploads/Student_img/1-1737615485-Girl.png', 'active', 'active', 1, '2025-01-23 00:58:05', '2025-01-23 00:58:05'),
(482, '582', NULL, '2025-01-23', 'ZAIFA FARHEEN IFZA', NULL, 'MD. ABUL FAISAL', NULL, '01930506676', 'FAHEMA SULTANA', NULL, '01729987290', NULL, '01729987290', '2022-10-02', 'Female', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1737615816-Girl.png', 'active', 'active', 1, '2025-01-23 01:03:36', '2025-01-23 01:03:36'),
(483, '583', NULL, '2025-01-23', 'FARHAN SADIQ BIN SELIM SADAF', NULL, 'SELIM REZA', NULL, '01735694461', 'TAHASINA AKTER', NULL, '01707683304', NULL, '01735694461', '2020-04-17', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737616324-Boy.png', 'active', 'active', 1, '2025-01-23 01:12:04', '2025-01-23 01:12:04'),
(484, '584', NULL, '2025-01-23', 'SADIA ISLAM SABIHA', NULL, 'SELIM REZA', NULL, '01735694461', 'TAHOSINA EITE', NULL, '01707683304', NULL, '01735694461', '2021-08-22', 'Female', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737618354-Girl.png', 'active', 'active', 1, '2025-01-23 01:45:54', '2025-01-23 01:45:54'),
(485, '585', NULL, '2025-01-26', 'MUHAMMAD KUSHAYAR ROHMAN', NULL, 'MD. SHAHADOT HOSSAIN', NULL, '01880798500', 'MST. UMME KULSUM', NULL, 'N/A', NULL, '01880798500', '2021-10-28', 'Male', NULL, 'Islam', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1737858170-Boy.png', 'active', 'active', 1, '2025-01-25 20:22:50', '2025-01-25 20:22:50'),
(486, '586', NULL, '2025-01-26', 'ADIAT WAGHIF AYAN', NULL, 'MD. ARIFUL ISLAM', NULL, '01890208696', 'MST. FARZANA AKTER', NULL, '01795671764', NULL, '01890208696', '2021-03-13', 'Male', NULL, 'Islam', NULL, NULL, 'DIPCHOR ,PABNA', 'DIPCHOR ,PABNA', 'uploads/Student_img/1-1737858640-Boy.png', 'active', 'active', 1, '2025-01-25 20:30:40', '2025-01-25 20:30:40'),
(487, '587', NULL, '2025-01-26', 'UMME HUMAYRA TUYBA', NULL, 'MD. SOHAN MONDOL', NULL, '01787880897', 'RITU KHATUN', NULL, '01777569276', NULL, '01787880897', '2020-12-21', 'Female', NULL, 'Islam', NULL, NULL, 'DIPCHOR,PABNA', 'DIPCHOR,PABNA', 'uploads/Student_img/1-1737858900-Girl.png', 'active', 'active', 1, '2025-01-25 20:35:00', '2025-01-25 20:35:00'),
(488, '588', NULL, '2025-01-26', 'NUR ISLAM', NULL, 'MD. ISMAIL HOSSAEN', NULL, '01768754377', 'MST. FATEMA YEASMIN', NULL, 'N/A', NULL, '01768754377', '2020-10-12', 'Male', NULL, 'Islam', NULL, NULL, 'DIPCHOR,PABNA', 'DIPCHOR,PABNA', 'uploads/Student_img/1-1737859149-Boy.png', 'active', 'active', 1, '2025-01-25 20:39:09', '2025-01-25 20:39:09'),
(489, '589', NULL, '2025-01-26', 'ARPITA DAS', NULL, 'OPU DAS', NULL, '01735638435', 'TULE DAS', NULL, '01305398323', NULL, '01305398323', '2020-12-20', 'Female', NULL, 'HINDU', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1737859708-Girl.png', 'active', 'active', 1, '2025-01-25 20:48:28', '2025-01-25 20:48:28'),
(490, '590', NULL, '2025-01-26', 'ADITRI KARMAKAR', NULL, 'PIJUSH KARMAKAR', NULL, '01737329288', 'EITY RANI', NULL, '01747942121', NULL, '01737329288', '2019-05-26', 'Female', NULL, 'SONATON', NULL, NULL, 'JOY KALI BARI ,PABNA', 'JOY KALI BARI ,PABNA', 'uploads/Student_img/1-1737860088-Girl.png', 'active', 'active', 1, '2025-01-25 20:54:48', '2025-01-25 20:54:48'),
(491, '591', NULL, '2025-01-26', 'ABDULLAH AL MURSALIN', NULL, 'MOTIRUL ISLAM', NULL, '01798216078', 'RATNA KHATUN', NULL, '01798426878', NULL, '01798426878', '2020-03-03', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737860322-Boy.png', 'active', 'active', 1, '2025-01-25 20:58:42', '2025-01-25 20:58:42'),
(492, '592', NULL, '2025-01-26', 'RAMISA ISHRAT MOURY', NULL, 'MD. REDOWAN RABBI', NULL, '01723153573', 'UMAIA BINTA MEGHLA', NULL, '01319392939', NULL, '01319392939', '2022-04-27', 'Female', NULL, 'Islam', NULL, NULL, 'DILALPUR,PABNA', 'DILALPUR,PABNA', 'uploads/Student_img/1-1737861584-Girl.png', 'active', 'active', 1, '2025-01-25 21:19:44', '2025-01-25 21:19:44'),
(493, '593', NULL, '2025-01-26', 'MST. SAMIA ISLAM NOWRIN', NULL, 'MD. NAZMUL HOSSAIN', NULL, '01768663634', 'MST. SONIA KHATUN', NULL, '01749957369', NULL, '01768663634', '2018-08-26', 'Female', NULL, 'Islam', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1737861811-Girl.png', 'active', 'active', 1, '2025-01-25 21:23:31', '2025-01-25 21:23:31'),
(494, '594', NULL, '2025-01-26', 'MST. TANHA', NULL, 'SHUVO', NULL, '01717774686', 'LIPI', NULL, '01781942419', '01781942419', '01781942419', '2019-12-17', 'Male', NULL, 'Islam', NULL, NULL, 'GOBINDA,PABNA', 'GOBINDA,PABNA', 'uploads/Student_img/1-1737872385-Girl.png', 'active', 'active', 1, '2025-01-26 00:19:45', '2025-01-26 00:19:45'),
(495, '595', NULL, '2025-01-26', 'AYZERIM BINTE ZAMAN', NULL, 'MD. ASIF ZAMAN', NULL, '01771728082', 'NAJIA SARANIKA', NULL, '01791827501', NULL, '01791827501', '2021-03-20', 'Female', NULL, 'Islam', NULL, NULL, 'KALACHADPARA,PABNA', 'KALACHADPARA,PABNA', 'uploads/Student_img/1-1737872736-Girl.png', 'active', 'active', 1, '2025-01-26 00:25:36', '2025-01-26 00:25:36'),
(496, '596', NULL, '2025-01-26', 'SAMAIRA SAFOWAN', NULL, 'SAAFI BIYAZID RAHIM', NULL, '01719322179', 'NISHAT TASNIM', NULL, '01720503030', NULL, '01720503030', '2021-05-13', 'Female', NULL, 'Islam', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1737873192-Girl.png', 'active', 'active', 1, '2025-01-26 00:33:12', '2025-01-26 00:33:12'),
(497, '597', NULL, '2025-01-26', 'MST. HUMAIRA ISLAM', NULL, 'MD. NAZRUL ISLAM', NULL, '01782623179', 'MST. SALEHA PARVIN', NULL, '01739164089', NULL, '01739164089', '2019-02-02', 'Female', NULL, 'Islam', NULL, NULL, 'LIBRERI BAZAR ,PABNA', 'LIBRERI BAZAR ,PABNA', 'uploads/Student_img/1-1737873440-Girl.png', 'active', 'active', 1, '2025-01-26 00:37:20', '2025-01-26 00:37:20'),
(498, '598', NULL, '2025-01-26', 'JUNNATUL FERDOUS', NULL, 'MD, FIRAR MAHMUD', NULL, '01717954662', 'JINIA JESMIN', NULL, '01797700893', NULL, '01717954662', '2021-02-18', 'Female', NULL, 'Islam', NULL, NULL, 'POLICE LINE,PABNA', 'POLICE LINE,PABNA', 'uploads/Student_img/1-1737873831-Girl.png', 'active', 'active', 1, '2025-01-26 00:43:51', '2025-01-26 00:43:51'),
(499, '599', NULL, '2025-01-26', 'FARZANA JUNNAT', NULL, 'MD. FIROZ MAHMUD', NULL, '01717954662', 'JINIA JESMIN', NULL, '0179770893', NULL, '01717954662', '2018-07-15', 'Female', NULL, 'Islam', NULL, NULL, 'POLICE LINE,PABNA', 'POLICE LINE,PABNA', 'uploads/Student_img/1-1737874088-Girl.png', 'active', 'active', 1, '2025-01-26 00:48:08', '2025-01-26 00:48:08'),
(500, '600', NULL, '2025-01-26', 'DEBBROTO SORKAR DIP', NULL, 'DOYAL CONDRO DAS', NULL, '01729446498', 'HASI RANI', NULL, '01781062054', NULL, '01729446498', '2021-04-20', 'Male', NULL, 'Islam', NULL, NULL, 'DILALPUR,PABNA', 'DILALPUR,PABNA', 'uploads/Student_img/1-1737874551-Boy.png', 'active', 'active', 1, '2025-01-26 00:55:51', '2025-01-26 00:55:51'),
(501, '601', NULL, '2025-01-26', 'ZAYNAB ANWAR', NULL, 'SARIF ANWAR', NULL, '01734060308', 'AFROJA PARVIN', NULL, '01753672156', NULL, '01734060338', '2019-05-21', 'Female', NULL, 'Islam', NULL, NULL, 'GHOSHPARA, PABNA', 'GHOSHPARA, PABNA', 'uploads/Student_img/1-1737874851-Boy.png', 'active', 'active', 1, '2025-01-26 01:00:51', '2025-01-26 01:00:51'),
(502, '602', NULL, '2025-01-26', 'Aisarya barnik asmi', NULL, 'ASIM BARNIK', NULL, '01793545720', 'POPY GHOSH', NULL, '01972286232', NULL, '01972286232', '2020-06-21', 'Female', NULL, 'Islam', NULL, NULL, 'CHAK SHATIANI', 'CHAK SHATIANI', 'uploads/Student_img/1-1737876506-Girl.png', 'active', 'active', 1, '2025-01-26 01:28:26', '2025-01-26 01:28:26'),
(503, '603', NULL, '2025-01-26', 'SHRESTHO CHAKRAVORTY RODDRO', NULL, 'BIVASH KUMAR CHAKRABORTY', NULL, '01936009354', 'SIMA RANI CHAKRABATY', NULL, '01794933531', NULL, '01794933531', '2019-10-01', 'Male', NULL, 'HINDU', NULL, NULL, 'JOR BANGLA', 'JOR BANGLA', 'uploads/Student_img/1-1737877082-Boy.png', 'active', 'active', 1, '2025-01-26 01:38:02', '2025-01-26 01:38:02'),
(504, '604', NULL, '2025-01-26', 'MARIYA TEETLY', NULL, 'MD. TANZIR RAHMAN KHAN', NULL, '01716696079', 'MST. LATA KHATUN', NULL, '01307000370', NULL, '01716696079', '2019-10-10', 'Female', NULL, 'Islam', NULL, NULL, 'DUBLIA,PABNA', 'DUBLIA,PABNA', 'uploads/Student_img/1-1737877429-Girl.png', 'active', 'active', 1, '2025-01-26 01:43:49', '2025-01-26 01:43:49'),
(505, '605', NULL, '2025-01-27', 'Dipto kumar vui mali', NULL, 'SHRI OCHENTO KUMAR', NULL, '01761166441', 'SHREEMOTI NUPUR', NULL, 'N/A', NULL, '01761166441', '2019-10-20', 'Male', NULL, 'HINDU', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1737946198-Boy.png', 'active', 'active', 1, '2025-01-26 20:49:58', '2025-01-26 20:49:58'),
(506, '606', NULL, '2025-01-27', 'SUBE SADIK', NULL, 'RIDOY', NULL, '01773212662', 'MST. SUMI AKTER', NULL, 'N/A', NULL, '01773212662', '2020-04-17', 'Male', NULL, 'Islam', NULL, NULL, 'HAJIRHAT', 'HAJIRHAT', 'uploads/Student_img/1-1737946375-Boy.png', 'active', 'active', 1, '2025-01-26 20:52:55', '2025-01-26 20:52:55'),
(507, '607', NULL, '2025-01-27', 'SHAHRIAR NAFIS CHOWDHURY', NULL, 'MD. ASHIQUR RAHMAN', NULL, '01771841845', 'SUNZIDA SIDDIKA', NULL, '01788395884', NULL, '01788395884', '2021-10-09', 'Male', NULL, 'Islam', NULL, NULL, 'MUNSURABAD,PABNAA', 'MUNSURABAD,PABNAA', 'uploads/Student_img/1-1737946634-Boy.png', 'active', 'active', 1, '2025-01-26 20:57:14', '2025-01-26 20:57:14'),
(508, '608', NULL, '2025-01-27', 'MD. ARAF BISWAS', NULL, 'ASADULLAH', NULL, '01711492481', 'URMILLA AKTER', NULL, '01735776161', NULL, '01735776161', '2018-08-29', 'Male', NULL, 'Islam', NULL, NULL, 'DIPCHOR ,PABNA', 'DIPCHOR ,PABNA', 'uploads/Student_img/1-1737948392-Boy.png', 'active', 'active', 1, '2025-01-26 21:26:32', '2025-01-26 21:26:32'),
(509, '609', NULL, '2025-01-27', 'KUMARI SHREYA RANI', NULL, 'SREE HOHADEB KUMAR', NULL, '0183770460', 'FULMOTI', NULL, '01724593789', NULL, '01724593789', '2021-06-16', 'Female', NULL, 'HINDU', NULL, NULL, 'KACARIPARA,PABNA', 'KACARIPARA,PABNA', 'uploads/Student_img/1-1737948675-Girl.png', 'active', 'active', 1, '2025-01-26 21:31:15', '2025-01-26 21:31:15'),
(510, '610', NULL, '2025-01-27', 'ABDUL RAHAMAN', NULL, 'MD. GOLAM MOSTOFA', NULL, '01712413448', 'JANNATUL NAHAR', NULL, '01725002353', NULL, '01725002353', '2019-12-31', 'Male', NULL, 'Islam', NULL, NULL, 'South  Ramchandropur,Pabna.', 'South  Ramchandropur,Pabna.', 'uploads/Student_img/1-1737957276-Boy.png', 'active', 'active', 1, '2025-01-26 23:54:36', '2025-01-26 23:54:36'),
(511, '611', NULL, '2025-01-27', 'ARISHA  HOK', NULL, 'AMIRUL ISLAM', NULL, '01614507824', 'ELA', NULL, '01762578947', NULL, '01762578949', '2020-08-01', 'Female', NULL, 'Islam', NULL, NULL, 'DOGACHI,PABNA', 'DOGACHI,PABNA', 'uploads/Student_img/1-1737957778-Girl.png', 'active', 'active', 1, '2025-01-27 00:02:58', '2025-01-27 00:02:58'),
(512, '612', NULL, '2025-01-27', 'TAMJID', NULL, 'MD. SOFI KAMAL', NULL, 'N/A', 'MST TASLIMA KHATUN', NULL, '01881880983', NULL, '01884431270', '2020-08-21', 'Male', NULL, 'Islam', NULL, NULL, 'VHANGGURA,PABNA', 'VHANGGURA,PABNA', 'uploads/Student_img/1-1737958069-Boy.png', 'active', 'active', 1, '2025-01-27 00:07:49', '2025-01-27 00:07:49'),
(513, '613', NULL, '2025-01-27', 'SHIRSTHO CHAKRAVOR TY', NULL, 'BIVASH KUMAR CHAKRABORTY', NULL, '01936009354', 'SIMA RANI', NULL, '01794933531', NULL, '017949335531', '2019-10-01', 'Male', NULL, 'HINDU', NULL, NULL, 'JOUR BANGLA', 'JOUR BANGLA', 'uploads/Student_img/1-1737960015-Boy.png', 'active', 'active', 1, '2025-01-27 00:40:15', '2025-01-27 00:40:15'),
(514, '614', NULL, '2025-01-27', 'MST. TAMANNA ISLAM', NULL, 'MD. TOBIUL ISLAM', NULL, '017314556299', 'MST. SHARMILA KHATUN', NULL, '01717635671', NULL, '01717635671', '2019-09-11', 'Female', NULL, 'Islam', NULL, NULL, 'PURBORAGHABPUR,SREEPUR,PABNA', 'PURBORAGHABPUR,SREEPUR,PABNA', 'uploads/Student_img/1-1737960764-Girl.png', 'active', 'active', 1, '2025-01-27 00:52:44', '2025-01-27 00:52:44'),
(515, '615', NULL, '2025-01-27', 'AYAN GOGON', NULL, 'RUKNUL ISLAM', NULL, '01725035160', 'MST. TASLEMA ISLAM', NULL, '01767579051', NULL, '01767579051', '2019-06-05', 'Male', NULL, 'Islam', NULL, NULL, 'AUTUA MOMENABAD,PABNA', 'AUTUA MOMENABAD,PABNA', 'uploads/Student_img/1-1737960942-Boy.png', 'active', 'active', 1, '2025-01-27 00:55:42', '2025-01-27 00:55:42'),
(516, '616', NULL, '2025-01-27', 'MAHAFUZUR RAHMAN MAHAFUZ', NULL, 'MD. MOHSIN ALI', NULL, '01745357021', 'MIM AKTER', NULL, '01773067296', NULL, '0174535021', '2018-12-06', 'Male', NULL, 'Islam', NULL, NULL, 'SHALGARIA,PABNA', 'SHALGARIA,PABNA', 'uploads/Student_img/1-1737961136-Boy.png', 'active', 'active', 1, '2025-01-27 00:58:56', '2025-01-27 00:58:56'),
(517, '617', NULL, '2025-01-27', 'AFIYA ISLAM', NULL, 'MD. ASHRAFUL ISLAM', NULL, '01726977079', 'SAKIBA SALMA', NULL, '01715428001', NULL, '01715428001', '2020-08-25', 'Female', NULL, 'Islam', NULL, NULL, 'KACARIPARA,PABNA', 'KACARIPARA,PABNA', 'uploads/Student_img/1-1737961515-Girl.png', 'active', 'active', 1, '2025-01-27 01:05:15', '2025-01-27 01:05:15'),
(520, '620', NULL, '2025-01-27', 'AHON AKTER', NULL, 'SAMLAL ECCA', NULL, '01776899501', 'MINOTI BASKEY', NULL, '01770887021', NULL, '01770887021', '2020-11-21', 'Male', NULL, 'HINDU', NULL, NULL, 'DOLALPUR,PABNA', 'DOLALPUR,PABNA', 'uploads/Student_img/1-1737962222-Girl.png', 'active', 'active', 1, '2025-01-27 01:17:02', '2025-01-27 01:17:02'),
(521, '621', NULL, '2025-01-27', 'TASNIA TANJIM XENAN', NULL, 'MD. MASUD RANA', NULL, '01740120370', 'ROKSANA PERVIN', NULL, '01742767972', NULL, '01742767972', '2020-10-08', 'Female', NULL, 'Islam', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1737962435-Girl.png', 'active', 'active', 1, '2025-01-27 01:20:35', '2025-01-27 01:20:35'),
(522, '622', NULL, '2025-02-04', 'Abdulla umor', NULL, 'MD. JOSIM UDDIN', NULL, '01714937537', 'SHARMIN KHATUN', NULL, '01776524445', NULL, '01714937537', '2019-05-17', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1738640140-Boy.png', 'active', 'active', 1, '2025-02-03 21:35:40', '2025-02-03 21:35:40'),
(523, '623', NULL, '2025-02-10', 'MOHIMA SULTANA', NULL, 'MD  RIZAUL SORDAR', NULL, '01328253431', 'MOST. DOLY KHATUN', NULL, '01996258361', NULL, '01996258361', '2020-04-09', 'Female', NULL, 'Islam', NULL, NULL, 'BOLORAMPUR,PABNA', 'BOLORAMPUR,PABNA', 'uploads/Student_img/1-1739169102-Girl.png', 'active', 'active', 1, '2025-02-10 00:31:42', '2025-02-10 00:31:42'),
(525, '625', NULL, '2025-02-12', 'RIYADUL ISLAM RAHAT', NULL, 'MD. MASUM PERVIN', NULL, 'N/A', 'MST. RAZIA SULTANA', NULL, '01766103986', NULL, '01766103986', '2018-10-23', 'Male', NULL, 'Islam', NULL, NULL, 'RAGHOBPUR,PABNA', 'RAGHOBPUR,PABNA', 'uploads/Student_img/1-1739328605-Boy.png', 'active', 'active', 1, '2025-02-11 20:50:05', '2025-02-11 20:50:05'),
(526, '626', NULL, '2025-02-12', 'ARIYAN AHMMED JOHAN', NULL, 'MD. MAHMUDUL HASAN', NULL, '01401013405', 'MST. AFATUZ JANNAT', NULL, '01783287188', NULL, '01783287188', '2020-03-16', 'Male', NULL, 'Islam', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1739330038-Boy.png', 'active', 'active', 1, '2025-02-11 21:13:58', '2025-02-11 21:13:58'),
(527, '627', NULL, '2025-05-27', 'Md yessin rahman', NULL, 'Ad Ataur rahman', NULL, '01721221400', 'SAMMI', NULL, '01302491803', NULL, '01302491803', '2021-01-15', 'Male', NULL, 'Islam', NULL, NULL, 'DUBLIYA,PABNA', 'DUBLIYA,PABNA', 'uploads/Student_img/1-1748332979-Boy.png', 'active', 'active', 1, '2025-05-27 02:02:59', '2025-05-27 02:02:59'),
(528, '628', NULL, '2025-05-27', 'MARIYAM', NULL, 'BOKUL', NULL, '01712765114', 'SATHI', NULL, '01773793984', NULL, '01773793984', '2029-12-14', 'Female', NULL, 'Islam', NULL, NULL, 'SREEPUR ,PABNA', 'SREEPUR ,PABNA', 'uploads/Student_img/1-1748333188-Girl.png', 'active', 'active', 1, '2025-05-27 02:06:28', '2025-05-27 02:06:28'),
(529, '629', NULL, '2026-02-23', 'SOHA', NULL, 'MD SHIHAB', NULL, '01851204121', 'MST ISRAT JAHAN SUMI', NULL, '01706144391', NULL, '01706144391', '2020-10-06', 'Female', NULL, 'ISLAM', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1771827630-Girl.png', 'active', 'active', 1, '2026-02-23 00:20:30', '2026-02-23 00:20:30'),
(530, '630', NULL, '2026-01-01', 'IFFAT JAHAN USHA', NULL, 'SHEHAB AL MARUF', NULL, '01719133948', 'MST TANIA SULTANA ANTARA', NULL, '01730907396', NULL, '01730907396', '2020-10-10', 'Female', NULL, 'ISLAM', NULL, NULL, 'DOHARPARA,PABNA', 'DOHARPARA,PABNA', 'uploads/Student_img/1-1771828163-Girl.png', 'active', 'active', 1, '2026-02-23 00:29:23', '2026-02-23 00:29:23'),
(531, '631', NULL, '2026-02-23', 'IFFAT JAHAN USHA', NULL, 'MARUF', NULL, '01719133948', 'TANIYA', NULL, '01730907396', NULL, '01730907396', '2020-10-10', 'Female', NULL, 'ISLAM', NULL, NULL, 'DOHARPARA,PABNA', 'DOHARPARA,PABNA', 'uploads/Student_img/1-1771828661-Girl.png', 'active', 'active', 1, '2026-02-23 00:37:41', '2026-02-23 00:37:41'),
(532, '632', NULL, '2026-02-23', 'AYAN', NULL, 'AHSAN HABIB', NULL, '01716772488', 'MST TANZLLA KHANOM', NULL, '01724396112', NULL, '01724396112', '2023-01-07', 'Male', NULL, 'ISLAM', NULL, NULL, 'GOBINDA', 'GOBINDA', 'uploads/Student_img/1-1771829022-Boy.png', 'active', 'active', 1, '2026-02-23 00:43:42', '2026-02-23 00:43:42'),
(533, '633', NULL, '2026-02-23', 'JAHIA JANNAT NUR', NULL, 'MD. KAISAR ALAM', NULL, '01740979757', 'ZAHANARA KHATUN', NULL, '01780546237', NULL, '01780546237', '2022-11-14', 'Female', NULL, 'ISLAM', NULL, NULL, 'ONONTO,  PABNA SADOR, PABNA', 'ONONTO,  PABNA SADOR, PABNA', 'uploads/Student_img/1-1771829463-Girl.png', 'active', 'active', 1, '2026-02-23 00:51:03', '2026-02-23 00:51:03'),
(534, '634', NULL, '2026-02-23', 'SIDRATUL MUNTAHA TANHA', NULL, 'SABBIR', NULL, '01817836561', 'SAIMA', NULL, '01788012235', NULL, '01788012235', '2021-12-09', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1771829764-Girl.png', 'active', 'active', 1, '2026-02-23 00:56:04', '2026-02-23 00:56:04'),
(535, '635', NULL, '2026-02-23', 'NUR MOHAMMED JAWAD', NULL, 'MD. SHAHIN HOSSAIN', NULL, 'N/A', 'MST MOMITA AKTER MOW', NULL, '01338777312', NULL, '01338777312', '2022-11-27', 'Male', NULL, 'ISLAM', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1771830088-Boy.png', 'active', 'active', 1, '2026-02-23 01:01:28', '2026-02-23 01:01:28'),
(536, '636', NULL, '2026-02-23', 'SALMAN AFIF DUHA', NULL, 'MD SAIDUL ISLAM', NULL, '0171525251422', 'AKHI KHATUN', NULL, '01309891912', NULL, '01309891912', '2023-01-15', 'Male', NULL, 'ISLAM', NULL, NULL, 'DIPCHOR, PABNA', 'DIPCHOR, PABNA', 'uploads/Student_img/1-1771830384-Boy.png', 'active', 'active', 1, '2026-02-23 01:06:24', '2026-02-23 01:06:24'),
(537, '637', NULL, '2026-02-23', 'ABU SINAN', NULL, 'EMRAN ALI', NULL, '01735933687', 'MST SURMA', NULL, '01789120130', NULL, '01789120130', '2021-12-07', 'Male', NULL, 'ISLAM', NULL, NULL, 'SORDARPARA,SALGARIYA,PABNA', 'SORDARPARA,SALGARIYA,PABNA', 'uploads/Student_img/1-1771830669-Boy.png', 'active', 'active', 1, '2026-02-23 01:11:09', '2026-02-23 01:11:09'),
(538, '638', NULL, '2026-02-23', 'NAZIBA NAWAR', NULL, 'MD. NAZMUL HAQUE', NULL, '01717291734', 'MST. TANZILA AFRIN', NULL, '01712716348', NULL, '01717291734', '2021-05-06', 'Female', NULL, 'ISLAM', NULL, NULL, 'RADHANAGOR,PABNA', 'RADHANAGOR,PABNA', 'uploads/Student_img/1-1771831034-Girl.png', 'active', 'active', 1, '2026-02-23 01:17:14', '2026-02-23 01:17:14'),
(539, '639', NULL, '2026-02-23', 'MD. ERFAN PRAMANIK', NULL, 'MD. HELAEL PRAMANIK', NULL, '01753424949', 'MST. SOPNA KHATUN', NULL, '01726759077', NULL, '01726759077', '2020-07-03', 'Male', NULL, 'ISLAM', NULL, NULL, 'CHAR ASHUTOSTUR,PABNA', 'CHAR ASHUTOSTUR,PABNA', 'uploads/Student_img/1-1771831669-Boy.png', 'active', 'active', 1, '2026-02-23 01:27:49', '2026-02-23 01:27:49'),
(540, '640', NULL, '2026-02-23', 'ARIYAN WAHID AYAN', NULL, 'MD. ZAHIDUL ISLAM', NULL, '01303815078', 'AYASHA AKTER', NULL, '01727592217', NULL, '01727592217', '2021-11-23', 'Male', NULL, 'ISLAM', NULL, NULL, 'RAJAPUR,PABNA', 'RAJAPUR,PABNA', 'uploads/Student_img/1-1771832023-Boy.png', 'active', 'active', 1, '2026-02-23 01:33:43', '2026-02-23 01:33:43'),
(541, '641', NULL, '2026-03-05', 'MD. ABU HUJAIFA', NULL, 'MD  OHIDUL ISLAM', NULL, '017282233095', 'MST  LABONI KHATUN', NULL, '01751563417', NULL, '01751563417', '2021-01-27', 'Male', NULL, 'ISLAM', NULL, NULL, 'BANGLA BAZAR,PABNA', 'BANGLA BAZAR,PABNA', 'uploads/Student_img/1-1772679434-Boy.png', 'active', 'active', 1, '2026-03-04 20:57:14', '2026-03-04 20:57:14'),
(542, '642', NULL, '2026-03-05', 'GOLAM HOSSAIN', NULL, 'GOLAM YASSIN', NULL, '01781041783', 'MST  KEYA KHATUN', NULL, '01794507714', NULL, '01781041783', '2021-03-15', 'Male', NULL, 'ISLAM', NULL, NULL, 'BALORAMPUR,PABNA', 'BALORAMPUR,PABNA', 'uploads/Student_img/1-1772679828-Boy.png', 'active', 'active', 1, '2026-03-04 21:03:49', '2026-03-04 21:03:49'),
(543, '643', NULL, '2026-03-05', 'ABDULLAH  AL ZAWAD', NULL, 'MD  ZAHURUL ISLAM', NULL, '01770408778', 'MST  SHARMIN FARHANA', NULL, '01770290930', NULL, '01770290930', '2021-07-21', 'Male', NULL, 'ISLAM', NULL, NULL, 'MASUM BAZAR,PABNA', 'MASUM BAZAR,PABNA', 'uploads/Student_img/1-1772680067-Boy.png', 'active', 'active', 1, '2026-03-04 21:07:47', '2026-03-04 21:07:47'),
(544, '644', NULL, '2026-03-05', 'MST  SIDRATUL MIM', NULL, 'MONIRUZZAMAN', NULL, '01717581325', 'NILA KHATUN', NULL, '017834998950', NULL, '01834998950', '2020-07-12', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772680337-Girl.png', 'active', 'active', 1, '2026-03-04 21:12:17', '2026-03-04 21:12:17'),
(545, '645', NULL, '2026-03-05', 'KASHFIYA JANNAT RANI', NULL, 'SHEK KAMAL HOSSEN', NULL, '01310846941', 'RITU KHATUN', NULL, '01310846941', NULL, '01310846941', '2021-07-04', 'Female', NULL, 'ISLAM', NULL, NULL, 'LASKERPUR,PABNA', 'LASKERPUR,PABNA', 'uploads/Student_img/1-1772685545-Girl.png', 'active', 'active', 1, '2026-03-04 22:39:05', '2026-03-04 22:39:05'),
(546, '646', NULL, '2026-03-05', 'MD MEHRAJ ALAM', NULL, 'MURSHID ALAM', NULL, '01714822646', 'SAKILA ZAMAN', NULL, '01723064534', NULL, '01723064534', '2021-12-01', 'Male', NULL, 'ISLAM', NULL, NULL, 'JORBANGLA ,PABNA', 'JORBANGLA ,PABNA', 'uploads/Student_img/1-1772685840-Boy.png', 'active', 'active', 1, '2026-03-04 22:44:00', '2026-03-04 22:44:00'),
(547, '647', NULL, '2026-03-05', 'KHONDOKAR SALMAN FERDAUS SHAFIN', NULL, 'KHONDOKAR ZULFIKAR HOUEQ', NULL, '01747477326', 'SHARMIN', NULL, '01743325749', NULL, '01743325749', '2021-01-01', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772686634-Boy.png', 'active', 'active', 1, '2026-03-04 22:57:14', '2026-03-04 22:57:14'),
(548, '648', NULL, '2026-03-05', 'ROMESH GHOSH', NULL, 'ROTON', NULL, '01734938934', 'CHAINA', NULL, '01347256365', NULL, '01347256365', '2020-10-14', 'Male', NULL, 'SONATON', NULL, NULL, 'RAMCHADROPUR,PABNA', 'RAMCHADROPUR,PABNA', 'uploads/Student_img/1-1772687271-Boy.png', 'active', 'active', 1, '2026-03-04 23:07:51', '2026-03-04 23:07:51'),
(549, '649', NULL, '2026-03-05', 'SIDRATUL MUNTAHA', NULL, 'MIRAZUL', NULL, '01733656055', 'ABEDA', NULL, '01849300864', NULL, '01849300864', '2022-09-10', 'Female', NULL, 'ISLAM', NULL, NULL, 'MUNSURABAD,PABNA', 'MUNSURABAD,PABNA', 'uploads/Student_img/1-1772687561-Girl.png', 'active', 'active', 1, '2026-03-04 23:12:41', '2026-03-04 23:12:41'),
(550, '650', NULL, '2026-03-08', 'Md SABITUR RAHMAN', NULL, 'SHAHIN', NULL, '01577306791', 'SUMI', NULL, '01760641096', NULL, '01760641096', '2020-11-12', 'Female', NULL, 'ISLAM', NULL, NULL, 'BOLORAMPUR,PABNA', 'BOLORAMPUR,PABNA', 'uploads/Student_img/1-1772939058-Girl.png', 'active', 'active', 1, '2026-03-07 21:04:18', '2026-03-07 21:04:18'),
(551, '651', NULL, '2026-03-08', 'JARIF HOSSAIN', NULL, 'JAFOR', NULL, '01324252002', 'BETHY', NULL, '01784835571', NULL, '01784835571', '2022-08-09', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772939273-Boy.png', 'active', 'active', 1, '2026-03-07 21:07:53', '2026-03-07 21:07:53'),
(552, '652', NULL, '2026-03-08', 'MEHENAJ AZBAH', NULL, 'MD ATIKUR ROHMAN', NULL, '01716180239', 'AKHINUR', NULL, '01704587276', NULL, '01704587276', '2021-03-03', 'Female', NULL, 'ISLAM', NULL, NULL, 'RAMCHADROPUR,PABNA', 'RAMCHADROPUR,PABNA', 'uploads/Student_img/1-1772939515-Girl.png', 'active', 'active', 1, '2026-03-07 21:11:55', '2026-03-07 21:11:55'),
(553, '653', NULL, '2026-03-08', 'ARAF TALUKDAR', NULL, 'RASEL', NULL, '01521509264', 'SHAILA', NULL, '01305948849', NULL, '01305948849', '2021-10-05', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH  RAMCGANDRAPUR ,PABNA', 'SOUTH  RAMCGANDRAPUR ,PABNA', 'uploads/Student_img/1-1772939762-Boy.png', 'active', 'active', 1, '2026-03-07 21:16:02', '2026-03-07 21:16:02'),
(554, '654', NULL, '2026-03-08', 'PRAISE ATRI BORMON PIKU', NULL, 'JEWEL BORMAN', NULL, '01737770504', 'AUDREY PRIYA', NULL, '01738768603', NULL, '01738768603', '2021-11-22', 'Female', NULL, 'ISLAM', NULL, NULL, 'MISSION HOUSE,PABNA', 'MISSION HOUSE,PABNA', 'uploads/Student_img/1-1772939997-Girl.png', 'active', 'active', 1, '2026-03-07 21:19:57', '2026-03-07 21:19:57'),
(555, '655', NULL, '2026-03-08', 'AYMAN HAMZA', NULL, 'MOSTOFA', NULL, '01758791059', 'SABINA', NULL, '01721210897', NULL, '01721210897', '2020-09-10', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772940317-Boy.png', 'active', 'active', 1, '2026-03-07 21:25:17', '2026-03-07 21:25:17'),
(556, '656', NULL, '2026-03-08', 'NUSRAT JAHAN KAZOL', NULL, 'MOSTOFA', NULL, '01738341269', 'RESMI', NULL, '01310604675', NULL, '01310604675', '2020-07-27', 'Female', NULL, 'ISLAM', NULL, NULL, 'DOHARPARA,PABNA', 'DOHARPARA,PABNA', 'uploads/Student_img/1-1772940540-Girl.png', 'active', 'active', 1, '2026-03-07 21:29:00', '2026-03-07 21:29:00'),
(557, '657', NULL, '2026-03-08', 'IBRAHIM KHOLILLULLAH', NULL, 'REJAUL', NULL, '01739118075', 'PAPIYA', NULL, '01748752445', NULL, '01748752445', '2021-02-15', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772940825-Boy.png', 'active', 'active', 1, '2026-03-07 21:33:45', '2026-03-07 21:33:45'),
(558, '658', NULL, '2026-03-08', 'MD MAINUL ISLAM', NULL, 'MD ARIFUL', NULL, '01763932593', 'MURSHIDA', NULL, '01774851715', NULL, '01763932593', '2021-12-31', 'Male', NULL, 'ISLAM', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1772941048-Boy.png', 'active', 'active', 1, '2026-03-07 21:37:28', '2026-03-07 21:37:28'),
(559, '659', NULL, '2026-03-08', 'SAYMA HASAN TUBA', NULL, 'MD  KAMRUL', NULL, '01749571475', 'URME', NULL, '01716524458', NULL, '01749571475', '2020-11-22', 'Female', NULL, 'ISLAM', NULL, NULL, 'BALORAMPUR,PABNA', 'BALORAMPUR,PABNA', 'uploads/Student_img/1-1772941228-Girl.png', 'active', 'active', 1, '2026-03-07 21:40:28', '2026-03-07 21:40:28'),
(560, '660', NULL, '2026-03-08', 'SHRUTI BASAK', NULL, 'RAMU', NULL, '01715651576', 'TULI', NULL, '01767867686', NULL, '01767867686', '2020-06-15', 'Female', NULL, 'SONATON', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1772941443-Girl.png', 'active', 'active', 1, '2026-03-07 21:44:03', '2026-03-07 21:44:03'),
(561, '661', NULL, '2026-03-08', 'SUBHE SADIK', NULL, 'RIHOD', NULL, '01736495491', 'SUMI', NULL, '01773212662', NULL, '01773212662', '2021-11-01', 'Male', NULL, 'ISLAM', NULL, NULL, 'HAZIRHAT,PABNA', 'HAZIRHAT,PABNA', 'uploads/Student_img/1-1772941649-Boy.png', 'active', 'active', 1, '2026-03-07 21:47:29', '2026-03-07 21:47:29'),
(562, '662', NULL, '2026-03-08', 'SAS  REHAN', NULL, 'REZAUL', NULL, '01711949536', 'SHOPNA', NULL, '01752050720', NULL, '01752050720', '2021-04-16', 'Male', NULL, 'ISLAM', NULL, NULL, 'SHIBRAMPUR,PABNA', 'SHIBRAMPUR,PABNA', 'uploads/Student_img/1-1772942307-Boy.png', 'active', 'active', 1, '2026-03-07 21:58:27', '2026-03-07 21:58:27'),
(563, '663', NULL, '2026-03-08', 'AHSABA KARRIM BIN', NULL, 'ASHRAFUL', NULL, '01735332337', 'NAIMA', NULL, '01711282109', NULL, '01711282109', '2020-07-19', 'Male', NULL, 'ISLAM', NULL, NULL, 'KACHARI PARA,PABNA', 'KACHARI PARA,PABNA', 'uploads/Student_img/1-1772942547-Boy.png', 'active', 'active', 1, '2026-03-07 22:02:27', '2026-03-07 22:02:27'),
(564, '664', NULL, '2026-03-08', 'MD  SALMAN FARSI', NULL, 'SALAM', NULL, '01761877560', 'JOLY', NULL, '0178608857', NULL, '01786008857', '2021-05-11', 'Male', NULL, 'ISLAM', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1772942831-Boy.png', 'active', 'active', 1, '2026-03-07 22:07:11', '2026-03-07 22:07:11'),
(565, '665', NULL, '2026-03-08', 'MURCHALIM  HOSSIN JARIF', NULL, 'MOSTOK', NULL, '01309907258', 'MITA', NULL, '017336891873', NULL, '017336891873', '2022-02-11', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772943200-Boy.png', 'active', 'active', 1, '2026-03-07 22:13:20', '2026-03-07 22:13:20'),
(566, '666', NULL, '2026-03-08', 'NOOR MOHAMMAD', NULL, 'MD MAHBUBUR RAHMAN', NULL, '01737792595', 'SHARMIN', NULL, '01703799715', NULL, '01703799715', '2022-11-14', 'Male', NULL, 'ISLAM', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1772943466-Boy.png', 'active', 'active', 1, '2026-03-07 22:17:46', '2026-03-07 22:17:46'),
(567, '667', NULL, '2026-03-08', 'MD  SAMIR KHAN', NULL, 'SUJON', NULL, '01712835355', 'SONJIDA', NULL, '01713515304', NULL, '01712835355', '2021-01-01', 'Male', NULL, 'ISLAM', NULL, NULL, 'KULADI', 'KULADI', 'uploads/Student_img/1-1772943666-Boy.png', 'active', 'active', 1, '2026-03-07 22:21:06', '2026-03-07 22:21:06'),
(568, '668', NULL, '2026-03-08', 'MST RUKAIYA AKTER', NULL, 'RUBEL', NULL, '01761668532', 'MST BRISHTI', NULL, '01744410141', NULL, '01761668532', '2021-06-20', 'Male', NULL, 'ISLAM', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1772943853-Girl.png', 'active', 'active', 1, '2026-03-07 22:24:13', '2026-03-07 22:24:13'),
(569, '669', NULL, '2026-03-08', 'ABDULLA HIL KAFI', NULL, 'MD  MOKHTADIA RAHMAN', NULL, '01714423754', 'LISHA', NULL, '01877010567', NULL, '01877010567', '2021-09-02', 'Male', NULL, 'ISLAM', NULL, NULL, 'SHALGARIYA,PABNA', 'SHALGARIYA,PABNA', 'uploads/Student_img/1-1772944670-Boy.png', 'active', 'active', 1, '2026-03-07 22:37:50', '2026-03-07 22:37:50'),
(570, '670', NULL, '2026-03-08', 'MD JAHEEN JUBAYER AYAAN', NULL, 'MOSUIUR', NULL, '01712512333', 'JANNATUL', NULL, '01756956878', NULL, '01756956878', '2020-06-04', 'Male', NULL, 'ISLAM', NULL, NULL, 'GOBINDA,PABNA', 'GOBINDA,PABNA', 'uploads/Student_img/1-1772944959-Boy.png', 'active', 'active', 1, '2026-03-07 22:42:39', '2026-03-07 22:42:39'),
(571, '671', NULL, '2026-03-08', 'SALMAN ZULKARNAIN', NULL, 'BULBUL AHAMED', NULL, '01764729955', 'AFROJA', NULL, '01781103151', NULL, '01781103151', '2020-08-08', 'Male', NULL, 'ISLAM', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1772945226-Boy.png', 'active', 'active', 1, '2026-03-07 22:47:06', '2026-03-07 22:47:06'),
(572, '672', NULL, '2026-03-08', 'HUMAIRA AKTER MARIYA', NULL, 'SERAZUL', NULL, '01746014321', 'MITA', NULL, '01817553432', NULL, '01817553432', '2021-03-08', 'Female', NULL, 'ISLAM', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1772945425-Girl.png', 'active', 'active', 1, '2026-03-07 22:50:25', '2026-03-07 22:50:25'),
(573, '673', NULL, '2026-03-08', 'TANISHA TABASSUM', NULL, 'KALU', NULL, '01725191483', 'SORNA', NULL, 'N/A', NULL, '01725191483', '2021-02-21', 'Female', NULL, 'ISLAM', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1772945606-Girl.png', 'active', 'active', 1, '2026-03-07 22:53:27', '2026-03-07 22:53:27'),
(574, '674', NULL, '2026-03-08', 'MD BAYZID KHAN', NULL, 'KAMRUL', NULL, '01791219265', 'KOMELA', NULL, '01714813412', NULL, '01791219265', '2020-09-20', 'Male', NULL, 'ISLAM', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1772945825-Boy.png', 'active', 'active', 1, '2026-03-07 22:57:05', '2026-03-07 22:57:05');
INSERT INTO `students` (`id`, `student_id`, `admission_no`, `admission_date`, `student_name`, `bangla_name`, `father_name`, `father_nid`, `father_mobile`, `mother_name`, `mother_nid`, `mother_mobile`, `guardian_name`, `guardian_mobile`, `dob`, `gender`, `blood_group`, `religion`, `email`, `student_bc`, `present_address`, `permanent_address`, `img_url`, `sms_status`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(575, '675', NULL, '2026-03-08', 'SUMAIYA TUJ MAIMUNA', NULL, 'MYNUL', NULL, '01608435026', 'MOLLIKA', NULL, '01305827416', NULL, '01608435026', '2021-02-17', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH  RAMCGANDRAPUR ,PABNA', 'SOUTH  RAMCGANDRAPUR ,PABNA', 'uploads/Student_img/1-1772946070-Girl.png', 'active', 'active', 1, '2026-03-07 23:01:10', '2026-03-07 23:01:10'),
(576, '676', NULL, '2026-03-08', 'ARWAA BINTE MOS', NULL, 'SHUVO', NULL, '01775015150', 'RIYA', NULL, '01713749093', NULL, '01713749093', '2021-05-20', 'Female', NULL, 'ISLAM', NULL, NULL, 'CADAKHAR BASH TLA,PABNA', 'CADAKHAR BASH TLA,PABNA', 'uploads/Student_img/1-1772946393-Girl.png', 'active', 'active', 1, '2026-03-07 23:06:33', '2026-03-07 23:06:33'),
(577, '677', NULL, '2026-03-08', 'SIDDARTHARTHA MODAK', NULL, 'SUBROTO', NULL, '01717954494', 'NITU', NULL, '01345903303', NULL, '01717954494', '2020-11-25', 'Male', NULL, 'SONATON', NULL, NULL, 'PATHORTOLA,PABNA', 'PATHORTOLA,PABNA', 'uploads/Student_img/1-1772952830-Boy.png', 'active', 'active', 1, '2026-03-08 00:53:50', '2026-03-08 00:53:50'),
(578, '678', NULL, '2026-03-08', 'NAFIA NAULAL OISHI', NULL, 'SIRAJUL', NULL, '01723886667', 'SUMAIYA', NULL, '01310691591', NULL, '01723886667', '2021-03-01', 'Female', NULL, 'ISLAM', NULL, NULL, 'DILALPUR ,PABNA', 'DILALPUR ,PABNA', 'uploads/Student_img/1-1772953055-Girl.png', 'active', 'active', 1, '2026-03-08 00:57:35', '2026-03-08 00:57:35'),
(579, '679', NULL, '2026-03-08', 'MAISHA TASLIM MUKTA', NULL, 'MANIK', NULL, '01751990082', 'JUTHI', NULL, '01312607260', NULL, '01312607260', '2021-02-15', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1772953307-Girl.png', 'active', 'active', 1, '2026-03-08 01:01:47', '2026-03-08 01:01:47'),
(580, '680', NULL, '2026-03-09', 'MD ABRAHAM SAAD', NULL, 'MANIK', NULL, '01767828825', 'MORIOUM', NULL, '01326501295', NULL, '01767828825', '2020-09-12', 'Male', NULL, 'ISLAM', NULL, NULL, 'LASKERPUR,PABNA', 'LASKERPUR,PABNA', 'uploads/Student_img/1-1773026740-Boy.png', 'active', 'active', 1, '2026-03-08 21:25:40', '2026-03-08 21:25:40'),
(581, '681', NULL, '2026-03-09', 'PRIYM PRAMANIK', NULL, 'ROTON', NULL, '01755580743', 'TONUSRI', NULL, '01576675271', NULL, '01576675271', '2022-11-30', 'Male', NULL, 'ISLAM', NULL, NULL, 'SHIBRAMPUR,PABNA', 'SHIBRAMPUR,PABNA', 'uploads/Student_img/1-1773026958-Boy.png', 'active', 'active', 1, '2026-03-08 21:29:18', '2026-03-08 21:29:18'),
(582, '682', NULL, '2026-03-09', 'ANISA MEHEJABIN EKRA', NULL, 'ISRAFIL', NULL, '01719127337', 'AISHA', NULL, '01742497138', NULL, '01719127337', '2020-12-18', 'Female', NULL, 'ISLAM', NULL, NULL, 'RAMCHADROPUR,PABNA', 'RAMCHADROPUR,PABNA', 'uploads/Student_img/1-1773027218-Girl.png', 'active', 'active', 1, '2026-03-08 21:33:38', '2026-03-08 21:33:38'),
(583, '683', NULL, '2026-03-09', 'ATTOJA JAMAN RAIHA', NULL, 'RASEL', NULL, '01724043474', 'TASLIMA', NULL, '01780188625', NULL, '01780188625', '2021-03-15', 'Female', NULL, 'ISLAM', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773027715-Girl.png', 'active', 'active', 1, '2026-03-08 21:41:55', '2026-03-08 21:41:55'),
(584, '684', NULL, '2026-03-09', 'NILADRI HASAN', NULL, 'MD JUBAIR', NULL, '01785567076', 'TAMANNA', NULL, '01783469757', NULL, '01783469757', '2021-04-07', 'Female', NULL, 'ISLAM', NULL, NULL, 'SHIVRAMPUR,PABNA', 'SHIVRAMPUR,PABNA', 'uploads/Student_img/1-1773028050-Girl.png', 'active', 'active', 1, '2026-03-08 21:47:30', '2026-03-08 21:47:30'),
(585, '685', NULL, '2026-03-09', 'SIDRATUL MUNTAHA SOHA', NULL, 'SABBIR', NULL, '01741782068', 'NILA', NULL, '01764508752', NULL, '01764508752', '2020-03-29', 'Female', NULL, 'ISLAM', NULL, NULL, 'SHIVRAMPUR,PABNA', 'SHIVRAMPUR,PABNA', 'uploads/Student_img/1-1773028318-Girl.png', 'active', 'active', 1, '2026-03-08 21:51:58', '2026-03-08 21:51:58'),
(586, '686', NULL, '2026-03-09', 'AREDHYA SAHA', NULL, 'SAGOR', NULL, '01757645282', 'RINKU', NULL, '1627884432', NULL, '01757645282', '2020-05-06', 'Female', NULL, 'ISLAM', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773028602-Girl.png', 'active', 'active', 1, '2026-03-08 21:56:42', '2026-03-08 21:56:42'),
(587, '687', NULL, '2026-03-09', 'TAIYBA AKTER', NULL, 'BIPLUB', NULL, '01349176625', 'JNNITI', NULL, '01349176625', NULL, '01349176625', '2026-03-09', 'Female', NULL, 'ISLAM', NULL, NULL, 'DIPCHOR, PABNA', 'DIPCHOR, PABNA', 'uploads/Student_img/1-1773028800-Girl.png', 'active', 'active', 1, '2026-03-08 22:00:00', '2026-03-08 22:00:00'),
(588, '688', NULL, '2026-03-09', 'MD YEASIN RAHMAN', NULL, 'ATAUR', NULL, '01721221400', 'SAMMI SALCHE', NULL, '01302491803', NULL, '01302491803', '2021-01-15', 'Male', NULL, 'ISLAM', NULL, NULL, 'DOGACHI,PABNA', 'DOGACHI,PABNA', 'uploads/Student_img/1-1773029163-Boy.png', 'active', 'active', 1, '2026-03-08 22:06:03', '2026-03-08 22:06:03'),
(589, '689', NULL, '2026-03-09', 'MORIAM', NULL, 'BOKUL', NULL, '01712765114', 'SATHI', NULL, '01773793984', NULL, '01773793984', '2019-12-14', 'Female', NULL, 'ISLAM', NULL, NULL, 'SREEPUR,PABNA', 'SREEPUR,PABNA', 'uploads/Student_img/1-1773029410-Girl.png', 'active', 'active', 1, '2026-03-08 22:10:10', '2026-03-08 22:10:10'),
(590, '690', NULL, '2026-03-09', 'ABRAR AHNAF AYASH', NULL, 'ROWSON', NULL, '01752523434', 'AZMIRA', NULL, '01752378875', NULL, '01752378875', '2019-09-25', 'Male', NULL, 'ISLAM', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773036050-Boy.png', 'active', 'active', 1, '2026-03-09 00:00:50', '2026-03-09 00:00:50'),
(591, '691', NULL, '2026-03-09', 'ARIYAN RAFI', NULL, 'RUBEL', NULL, '01756661548', 'AFROZ', NULL, '01724185428', NULL, '01756661548', '2021-08-23', 'Female', NULL, 'ISLAM', NULL, NULL, 'BANGLA BAZAR,PABNA', 'BANGLA BAZAR,PABNA', 'uploads/Student_img/1-1773039394-Girl.png', 'active', 'active', 1, '2026-03-09 00:56:34', '2026-03-09 00:56:34'),
(592, '692', NULL, '2026-03-09', 'ARISHA TANAZ AYRA', NULL, 'ASHADUL', NULL, '01720202833', 'ASHAPURNA', NULL, '01726222697', NULL, '01720202833', '2021-12-08', 'Female', NULL, 'ISLAM', NULL, NULL, 'DAKHINRAGHOBPUR,PABNA', 'DAKHINRAGHOBPUR,PABNA', 'uploads/Student_img/1-1773039730-Girl.png', 'active', 'active', 1, '2026-03-09 01:02:10', '2026-03-09 01:02:10'),
(593, '693', NULL, '2026-03-09', 'MAHADI AHSAN ISHMAN', NULL, 'AHSAN', NULL, '01781821312', 'HOMAYRA', NULL, '01811440614', NULL, '01811440614', '2021-02-10', 'Male', NULL, 'ISLAM', NULL, NULL, 'ARIFPUR ,PABNA', 'ARIFPUR ,PABNA', 'uploads/Student_img/1-1773039982-Boy.png', 'active', 'active', 1, '2026-03-09 01:06:22', '2026-03-09 01:06:22'),
(594, '694', NULL, '2026-03-09', 'OISHANY MAZUMDER', NULL, 'SURAJ', NULL, '01721672340', 'SUSMITA', NULL, '01789376600', NULL, '01759376600', '2022-01-01', 'Female', NULL, 'SONATON', NULL, NULL, 'SHIBRAMPUR,PABNA', 'SHIVRAMPUR,PABNA', 'uploads/Student_img/1-1773040342-Girl.png', 'active', 'active', 1, '2026-03-09 01:12:22', '2026-03-09 01:12:22'),
(595, '695', NULL, '2026-03-09', 'SADDHO SAHA', NULL, 'SABUJ', NULL, '01792409145', 'SHORMITA', NULL, '01768116342', NULL, '01792409145', '2022-09-22', 'Male', NULL, 'SONATON', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773040636-Boy.png', 'active', 'active', 1, '2026-03-09 01:17:16', '2026-03-09 01:17:16'),
(596, '696', NULL, '2026-03-09', 'YEAMIN AHMMAD', NULL, 'ROKONUZZAMAN', NULL, '0177669995', 'SARMIN', NULL, '01332140356', NULL, '01332140356', '2020-09-06', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH  RAMCGANDRAPUR ,PABNA', 'SOUTH RAMCHADROPUR,PABNA', 'uploads/Student_img/1-1773040921-Boy.png', 'active', 'active', 1, '2026-03-09 01:22:01', '2026-03-09 01:22:01'),
(597, '697', NULL, '2026-03-10', 'AZAAN BIN MOHAMMAD ABU HASAN', NULL, 'HASAN', NULL, '01878624475', 'ISMAHAT', NULL, '01709767959', NULL, '01709767959', '2020-11-12', 'Male', NULL, 'ISLAM', NULL, NULL, 'BANSHER BADA,ISHWARDI,PABNA', 'BANSHER BADA,ISHWARDI,PABNA', 'uploads/Student_img/1-1773110692-Boy.png', 'active', 'active', 1, '2026-03-09 20:44:52', '2026-03-09 20:44:52'),
(598, '698', NULL, '2026-03-10', 'MOHAMMAD ARAF', NULL, 'ABDUL KHALEK', NULL, '01739413385', 'NUSRAT', NULL, '01309633511', NULL, '01739413385', '2019-05-07', 'Male', NULL, 'ISLAM', NULL, NULL, 'KACHA', 'KACHARI PARA,PABNA', 'uploads/Student_img/1-1773110922-Boy.png', 'active', 'active', 1, '2026-03-09 20:48:42', '2026-03-09 20:48:42'),
(599, '699', NULL, '2026-03-10', 'MD  ABDULLAH AL MASUR', NULL, 'MAMUN', NULL, '01762868941', 'SAKIFA', NULL, '01762868940', NULL, '01762868941', '2019-09-29', 'Male', NULL, 'ISLAM', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773111369-Boy.png', 'active', 'active', 1, '2026-03-09 20:56:09', '2026-03-09 20:56:09'),
(600, '700', NULL, '2026-03-10', 'ABDUR RAHMAN', NULL, 'LETON', NULL, '01719717672', 'KHADIJA', NULL, '01793979207', NULL, '01793979207', '2018-06-04', 'Male', NULL, 'ISLAM', NULL, NULL, 'MUJAHID CLUB,PABNA', 'MUJAHID CLUB,PABNA', 'uploads/Student_img/1-1773111833-Boy.png', 'active', 'active', 1, '2026-03-09 21:03:53', '2026-03-09 21:03:53'),
(601, '701', NULL, '2026-03-10', 'MAHNOOR HQQUL', NULL, 'MAHFUZUR', NULL, '01770777060', 'SHAMIMA', NULL, '01791777400', NULL, '01791777400', '2019-03-07', 'Female', NULL, 'ISLAM', NULL, NULL, 'RAZAPUR,PABNA', 'RAZAPUR,PABNA', 'uploads/Student_img/1-1773112145-Girl.png', 'active', 'active', 1, '2026-03-09 21:09:05', '2026-03-09 21:09:05'),
(602, '702', NULL, '2026-03-10', 'SALMAN FARSI ARAF', NULL, 'SOHEL RANA', NULL, '01714591785', 'KARIMA', NULL, '01771716008', NULL, '01771716008', '2018-12-18', 'Male', NULL, 'ISLAM', NULL, NULL, 'DIPCHOR, PABNA', 'DIPCHOR, PABNA', 'uploads/Student_img/1-1773112433-Boy.png', 'active', 'active', 1, '2026-03-09 21:13:53', '2026-03-09 21:13:53'),
(603, '703', NULL, '2026-03-10', 'SRUTI SAHA', NULL, 'GOPAL', NULL, '01714656287', 'ANJU', NULL, '01749120379', NULL, '01749120379', '2018-05-12', 'Female', NULL, 'SONATON', NULL, NULL, 'RAMCHADROPUR,PABNA', 'RAMCHADROPUR,PABNA', 'uploads/Student_img/1-1773112932-Girl.png', 'active', 'active', 1, '2026-03-09 21:22:12', '2026-03-09 21:22:12'),
(604, '704', NULL, '2026-03-10', 'MD SAFWAN ARBIN AYAN', NULL, 'ABDULLAH MASUD', NULL, '01748609006', 'SAPNA', NULL, '01771480322', NULL, '01771480322', '2020-09-28', 'Male', NULL, 'ISLAM', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773113770-Boy.png', 'active', 'active', 1, '2026-03-09 21:36:10', '2026-03-09 21:36:10'),
(605, '705', NULL, '2026-03-10', 'ABID HASAN', NULL, 'SADIKUL', NULL, '01759933482', 'HIRA', NULL, '01311946180', NULL, '01759933482', '2020-09-25', 'Male', NULL, 'ISLAM', NULL, NULL, 'TECHNICAL SCHOOL AND PABNA', 'TECHNICAL SCHOOL AND PABNA', 'uploads/Student_img/1-1773114126-Boy.png', 'active', 'active', 1, '2026-03-09 21:42:06', '2026-03-09 21:42:06'),
(606, '706', NULL, '2026-03-10', 'ARAF IBNE RAHIN', NULL, 'ABU SAID', NULL, '01710183248', 'ATIARA', NULL, '01861771154', NULL, '01861771154', '2020-01-01', 'Male', NULL, 'ISLAM', NULL, NULL, 'MUNSURABAD,PABNA', 'MUNSURABAD,PABNA', 'uploads/Student_img/1-1773114361-Boy.png', 'active', 'active', 1, '2026-03-09 21:46:01', '2026-03-09 21:46:01'),
(607, '707', NULL, '2026-03-10', 'ARIYAN SHAFI', NULL, 'AHAMMED ALI', NULL, '01700980494', 'ASMA', NULL, '01304330431', NULL, '01700980494', '2020-02-20', 'Male', NULL, 'ISLAM', NULL, NULL, 'SADHUPARA,PABNA', 'SADHUPARA,PABNA', 'uploads/Student_img/1-1773115032-Boy.png', 'active', 'active', 1, '2026-03-09 21:57:12', '2026-03-09 21:57:12'),
(608, '708', NULL, '2026-03-11', 'SAJID HASAN JAFIN', NULL, 'JAHID', NULL, '01755218222', 'LIZA', NULL, '01645402320', NULL, '01645402320', '2021-04-15', 'Male', NULL, 'ISLAM', NULL, NULL, 'KULUNIYA,DOGACHI', 'KULUNIYA,DOGACHI', 'uploads/Student_img/1-1773199228-Boy.png', 'active', 'active', 1, '2026-03-10 21:20:28', '2026-03-10 21:20:28'),
(609, '709', NULL, '2026-03-11', 'PRIONTY KORMOKAR', NULL, 'GOUTOM', NULL, '01973325993', 'BRISTY', NULL, '01773325993', NULL, '01773325993', '2019-10-10', 'Female', NULL, 'SONATON', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1773199521-Girl.png', 'active', 'active', 1, '2026-03-10 21:25:21', '2026-03-10 21:25:21'),
(610, '710', NULL, '2026-03-11', 'SAFWAT TIBRO KHAN', NULL, 'SHOAIB', NULL, '01723291029', 'SHARMIN', NULL, '01789087783', NULL, '01789087783', '2019-10-06', 'Male', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1773199933-Boy.png', 'active', 'active', 1, '2026-03-10 21:32:13', '2026-03-10 21:32:13'),
(611, '711', NULL, '2026-03-11', 'TAQWA USHNATA KHAN', NULL, 'SHOJIB', NULL, '01723291029', 'SHARMIN', NULL, '01789087783', NULL, '01789087783', '2019-06-06', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1773200173-Girl.png', 'active', 'active', 1, '2026-03-10 21:36:13', '2026-03-10 21:36:13'),
(612, '712', NULL, '2026-03-11', 'HAYJID HOSSAIN', NULL, 'ROBIUL', NULL, '01722425767', 'BORSHA', NULL, '01790829228', NULL, '01790829228', '2020-11-15', 'Male', NULL, 'ISLAM', NULL, NULL, 'BALORAMPUR,PABNA', 'BOLORAMPUR,PABNA', 'uploads/Student_img/1-1773200386-Boy.png', 'active', 'active', 1, '2026-03-10 21:39:46', '2026-03-10 21:39:46'),
(613, '713', NULL, '2026-03-11', 'SOMRIDDHA SAHA', NULL, 'SONJOY', NULL, '01313191510', 'MUNMUN', NULL, '01727229118', NULL, '01727229118', '2020-06-18', 'Male', NULL, 'SONATON', NULL, NULL, 'GOPALPUR,PABNA', 'GOPALPUR,PABNA', 'uploads/Student_img/1-1773200683-Boy.png', 'active', 'active', 1, '2026-03-10 21:44:43', '2026-03-10 21:44:43'),
(614, '714', NULL, '2026-03-11', 'MAYESHA FARJANA', NULL, 'MATIN', NULL, '01748934163', 'RIKTA', NULL, '01792372934', NULL, '01748934163', '2021-01-07', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1773200984-Girl.png', 'active', 'active', 1, '2026-03-10 21:49:44', '2026-03-10 21:49:44'),
(615, '715', NULL, '2026-03-11', 'SHEIKH ABDULLAH AL SAADI', NULL, 'LITON', NULL, '01717494512', 'SHELI', NULL, '01911530842', NULL, '01717494512', '2019-05-03', 'Male', NULL, 'ISLAM', NULL, NULL, 'TEBUNIYA,PABNA', 'TEBUNIYA,PABNA', 'uploads/Student_img/1-1773214557-Boy.png', 'active', 'active', 1, '2026-03-11 01:35:57', '2026-03-11 01:35:57'),
(616, '716', NULL, '2026-04-12', 'ABRAHAM  MEHEMED', NULL, 'ANAWAR', NULL, '01610832763', 'JANNAT AKHI', NULL, '01764971517', NULL, '01764971517', '2017-09-13', 'Male', NULL, 'ISLAM', NULL, NULL, 'PABNA', 'PABNA', 'uploads/Student_img/1-1775973183-Boy.png', 'active', 'active', 1, '2026-04-11 23:53:03', '2026-04-11 23:53:03'),
(617, '717', NULL, '2026-04-12', 'RAJASHNA PAL EDHITA', NULL, 'BABLU', NULL, '01768708081', 'ETI', NULL, '017435334224', NULL, '01768708081', '2022-10-20', 'Male', NULL, 'SONATON', NULL, NULL, 'POLICE FARI ,PABNA', 'POLICE FARI ,PABNA', 'uploads/Student_img/1-1775973439-Girl.png', 'active', 'active', 1, '2026-04-11 23:57:19', '2026-04-11 23:57:19'),
(618, '718', NULL, '2026-04-12', 'TASHRIN HAQUE', NULL, 'MD ARIFUL', NULL, '01719328168', 'SUMAIYA', NULL, '01701717242', NULL, '01701717242', '2021-02-04', 'Male', NULL, 'ISLAM', NULL, NULL, 'RAMCHADROPUR,PABNA', 'RAMCHADROPUR,PABNA', 'uploads/Student_img/1-1775975078-Boy.png', 'active', 'active', 1, '2026-04-12 00:24:38', '2026-04-12 00:24:38'),
(619, '719', NULL, '2026-04-12', 'TAFSI TAYATUL KABIR FATIHA', NULL, 'MD HUMAUN', NULL, '01717443131', 'JASMIN', NULL, '01751095452', NULL, '01751095452', '2022-10-07', 'Female', NULL, 'ISLAM', NULL, NULL, 'SHADHUPARA,PABNA', 'SHADHUPARA,PABNA', 'uploads/Student_img/1-1775975492-Girl.png', 'active', 'active', 1, '2026-04-12 00:31:32', '2026-04-12 00:31:32'),
(620, '720', NULL, '2026-04-12', 'ADIL MAHADI AIMAN', NULL, 'SAIFUL', NULL, '01710457306', 'SIMA', NULL, '01720265037', NULL, '01720265037', '2022-02-01', 'Female', NULL, 'ISLAM', NULL, NULL, 'SOUTH RAGHOBPUR,PABNA', 'SOUTH RAGHOBPUR,PABNA', 'uploads/Student_img/1-1775976128-Boy.png', 'active', 'active', 1, '2026-04-12 00:42:08', '2026-04-12 00:42:08');

-- --------------------------------------------------------

--
-- Table structure for table `student_registrations`
--

CREATE TABLE `student_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_roll` varchar(255) NOT NULL,
  `registration_date` date NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `shift_id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_registrations`
--

INSERT INTO `student_registrations` (`id`, `class_roll`, `registration_date`, `student_id`, `shift_id`, `section_id`, `class_id`, `session_id`, `group_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, '14', '2024-06-04', 1, 2, 1, 1, 1, NULL, 1, '2024-06-04 15:45:45', '2024-06-04 15:45:45'),
(2, '17', '2024-06-04', 2, 2, 1, 1, 1, NULL, 1, '2024-06-04 16:28:09', '2024-06-04 16:28:09'),
(3, '33', '2024-06-04', 3, 2, 1, 1, 1, NULL, 1, '2024-06-04 16:35:10', '2024-06-04 16:35:10'),
(4, '38', '2024-06-04', 4, 2, 1, 1, 1, NULL, 1, '2024-06-04 16:58:00', '2024-06-04 16:58:00'),
(17, '25', '2024-06-05', 17, 1, 2, 2, 1, NULL, 1, '2024-06-05 12:00:32', '2024-06-05 12:00:32'),
(20, '38', '2024-06-05', 20, 1, 5, 3, 1, NULL, 1, '2024-06-05 13:11:02', '2024-06-05 13:11:02'),
(21, '37', '2024-06-05', 21, 1, 5, 3, 1, NULL, 1, '2024-06-05 13:17:25', '2024-06-05 13:17:25'),
(30, '21', '2024-06-05', 30, 1, 8, 4, 1, NULL, 1, '2024-06-05 14:31:14', '2024-06-05 14:31:14'),
(37, '23', '2024-06-05', 37, 1, 8, 4, 1, NULL, 1, '2024-06-05 15:45:26', '2024-06-05 15:45:26'),
(40, '02', '2024-06-05', 40, 1, 8, 4, 1, NULL, 1, '2024-06-05 16:03:48', '2024-06-05 16:03:48'),
(41, '03', '2024-06-05', 41, 1, 8, 4, 1, NULL, 1, '2024-06-05 16:10:51', '2024-06-05 16:10:51'),
(44, '08', '2024-06-05', 44, 1, 8, 4, 1, NULL, 1, '2024-06-05 16:34:58', '2024-06-05 16:34:58'),
(45, '34', '2024-06-05', 45, 1, 8, 4, 1, NULL, 1, '2024-06-05 16:40:18', '2024-06-05 16:40:18'),
(48, '10', '2024-06-05', 48, 1, 8, 4, 1, NULL, 1, '2024-06-05 16:57:07', '2024-06-05 16:57:07'),
(49, '17', '2024-06-05', 49, 1, 8, 4, 1, NULL, 1, '2024-06-05 17:03:18', '2024-06-05 17:03:18'),
(50, '04', '2024-06-05', 50, 1, 8, 4, 1, NULL, 1, '2024-06-05 17:05:38', '2024-06-05 17:05:38'),
(51, '29', '2024-06-05', 51, 1, 8, 4, 1, NULL, 1, '2024-06-05 17:11:04', '2024-06-05 17:11:04'),
(52, '06', '2024-06-05', 52, 1, 2, 2, 1, NULL, 1, '2024-06-05 17:20:46', '2024-06-05 17:20:46'),
(53, '14', '2024-06-05', 53, 1, 8, 4, 1, NULL, 1, '2024-06-05 17:25:53', '2024-06-05 17:25:53'),
(54, '12', '2024-06-05', 54, 1, 8, 4, 1, NULL, 1, '2024-06-05 17:44:01', '2024-06-05 17:44:01'),
(55, '18', '2024-06-05', 55, 1, 8, 4, 1, NULL, 1, '2024-06-05 17:50:17', '2024-06-05 17:50:17'),
(56, '30', '2024-06-05', 56, 1, 5, 3, 1, NULL, 1, '2024-06-05 17:56:37', '2024-06-05 17:56:37'),
(57, '22', '2024-06-05', 57, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:01:28', '2024-06-05 18:01:28'),
(58, '31', '2024-06-05', 58, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:05:59', '2024-06-05 18:05:59'),
(59, '15', '2024-06-05', 59, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:10:38', '2024-06-05 18:10:38'),
(60, '44', '2024-06-05', 60, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:15:42', '2024-06-05 18:15:42'),
(61, '33', '2024-06-05', 61, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:20:53', '2024-06-05 18:20:53'),
(62, '51', '2024-06-05', 62, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:25:50', '2024-06-05 18:25:50'),
(63, '16', '2024-06-05', 63, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:30:08', '2024-06-05 18:30:08'),
(64, '35', '2024-06-05', 64, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:36:11', '2024-06-05 18:36:11'),
(65, '36', '2024-06-05', 65, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:44:12', '2024-06-05 18:44:12'),
(66, '40', '2024-06-05', 67, 1, 5, 3, 1, NULL, 1, '2024-06-05 18:48:37', '2024-06-05 18:48:37'),
(67, '34', '2024-06-06', 68, 1, 5, 3, 1, NULL, 1, '2024-06-06 10:18:29', '2024-06-06 10:18:29'),
(68, '42', '2023-06-06', 69, 1, 5, 3, 1, NULL, 1, '2024-06-06 10:42:45', '2024-06-06 10:42:45'),
(69, '14', '2024-06-06', 70, 1, 5, 3, 1, NULL, 1, '2024-06-06 11:23:48', '2024-06-06 11:23:48'),
(70, '52', '2024-06-06', 71, 1, 5, 3, 1, NULL, 1, '2024-06-06 11:31:17', '2024-06-06 11:31:17'),
(72, '48', '2024-06-06', 74, 1, 5, 3, 1, NULL, 1, '2024-06-06 11:42:26', '2024-06-06 11:42:26'),
(73, '05', '2024-06-06', 75, 1, 5, 3, 1, NULL, 1, '2024-06-06 11:48:26', '2024-06-06 11:48:26'),
(74, '47', '2024-06-06', 76, 1, 5, 3, 1, NULL, 1, '2024-06-06 11:54:39', '2024-06-06 11:54:39'),
(75, '12', '2024-06-06', 77, 1, 5, 3, 1, NULL, 1, '2024-06-06 11:58:09', '2024-06-06 11:58:09'),
(76, '08', '2024-06-06', 78, 1, 5, 3, 1, NULL, 1, '2024-06-06 12:02:47', '2024-06-06 12:02:47'),
(77, '28', '2024-06-06', 79, 1, 5, 3, 1, NULL, 1, '2024-06-06 12:06:24', '2024-06-06 12:06:24'),
(78, '14', '2024-06-06', 80, 1, 2, 2, 1, NULL, 1, '2024-06-06 12:23:27', '2024-06-06 12:23:27'),
(79, '16', '2024-06-06', 81, 1, 2, 2, 1, NULL, 1, '2024-06-06 12:27:20', '2024-06-06 12:27:20'),
(80, '18', '2024-06-06', 82, 1, 2, 2, 1, NULL, 1, '2024-06-06 12:32:49', '2024-06-06 12:32:49'),
(81, '21', '2024-06-06', 83, 1, 2, 2, 1, NULL, 1, '2024-06-06 12:36:23', '2024-06-06 12:36:23'),
(82, '32', '2024-06-06', 84, 1, 2, 2, 1, NULL, 1, '2024-06-06 12:40:18', '2024-06-06 12:40:18'),
(83, '27', '2024-06-06', 85, 1, 2, 2, 1, NULL, 1, '2024-06-06 13:55:08', '2024-06-06 13:55:08'),
(84, '27', '2024-06-06', 86, 1, 8, 4, 1, NULL, 1, '2024-06-06 13:59:35', '2024-06-06 13:59:35'),
(85, '11', '2024-06-06', 87, 1, 8, 4, 1, NULL, 1, '2024-06-06 15:21:31', '2024-06-06 15:21:31'),
(86, '13', '2024-06-06', 88, 1, 2, 2, 1, NULL, 1, '2024-06-06 15:29:22', '2024-06-06 15:29:22'),
(89, '17', '2024-06-06', 91, 1, 2, 2, 1, NULL, 1, '2024-06-06 15:54:21', '2024-06-06 15:54:21'),
(96, '24', '2024-06-06', 98, 1, 3, 2, 1, NULL, 1, '2024-06-06 16:37:29', '2024-06-06 16:37:29'),
(97, '09', '2024-06-06', 99, 1, 3, 2, 1, NULL, 1, '2024-06-06 16:43:45', '2024-06-06 16:43:45'),
(98, '11', '2024-06-06', 100, 1, 3, 2, 1, NULL, 1, '2024-06-06 16:48:14', '2024-06-06 16:48:14'),
(99, '21', '2024-06-06', 101, 1, 3, 2, 1, NULL, 1, '2024-06-06 16:54:48', '2024-06-06 16:54:48'),
(100, '34', '2024-06-06', 102, 1, 3, 2, 1, NULL, 1, '2024-06-06 16:59:18', '2024-06-06 16:59:18'),
(101, '16', '2024-06-06', 103, 1, 3, 2, 1, NULL, 1, '2024-06-06 17:07:53', '2024-06-06 17:07:53'),
(102, '05', '2024-06-06', 104, 1, 3, 2, 1, NULL, 1, '2024-06-06 17:12:13', '2024-06-06 17:12:13'),
(103, '13', '2024-06-06', 105, 1, 3, 2, 1, NULL, 1, '2024-06-06 17:18:07', '2024-06-06 17:18:07'),
(104, '23', '2024-06-06', 106, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:27:41', '2024-06-06 17:27:41'),
(105, '39', '2024-06-06', 107, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:32:03', '2024-06-06 17:32:03'),
(106, '04', '2024-06-06', 108, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:36:21', '2024-06-06 17:36:21'),
(107, '01', '2024-06-06', 109, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:41:30', '2024-06-06 17:41:30'),
(108, '22', '2024-06-06', 110, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:45:51', '2024-06-06 17:45:51'),
(109, '38', '2024-06-06', 111, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:50:19', '2024-06-06 17:50:19'),
(110, '11', '2024-06-06', 112, 1, 6, 3, 1, NULL, 1, '2024-06-06 17:56:23', '2024-06-06 17:56:23'),
(111, '45', '2024-06-06', 113, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:00:55', '2024-06-06 18:00:55'),
(112, '43', '2024-06-06', 114, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:04:49', '2024-06-06 18:04:49'),
(113, '03', '2024-06-06', 115, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:09:14', '2024-06-06 18:09:14'),
(114, '02', '2024-06-06', 116, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:12:59', '2024-06-06 18:12:59'),
(115, '13', '2024-06-06', 117, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:17:25', '2024-06-06 18:17:25'),
(116, '29', '2024-06-06', 118, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:21:08', '2024-06-06 18:21:08'),
(117, '31', '2024-06-06', 119, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:24:56', '2024-06-06 18:24:56'),
(118, '16', '2024-06-06', 120, 1, 6, 3, 1, NULL, 1, '2024-06-06 18:27:59', '2024-06-06 18:27:59'),
(119, '14', '2024-06-08', 121, 1, 3, 2, 1, NULL, 1, '2024-06-08 20:45:38', '2024-06-08 20:45:38'),
(120, '32', '2024-06-08', 122, 1, 3, 2, 1, NULL, 1, '2024-06-08 20:50:57', '2024-06-08 20:50:57'),
(121, '20', '2024-06-08', 123, 1, 3, 2, 1, NULL, 1, '2024-06-08 20:55:36', '2024-06-08 20:55:36'),
(122, '07', '2024-06-08', 124, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:00:22', '2024-06-08 21:00:22'),
(123, '01', '2024-06-08', 126, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:08:21', '2024-06-08 21:08:21'),
(124, '18', '2024-06-08', 127, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:16:11', '2024-06-08 21:16:11'),
(125, '10', '2024-06-08', 128, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:20:30', '2024-06-08 21:20:30'),
(126, '33', '2024-06-08', 129, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:28:35', '2024-06-08 21:28:35'),
(127, '19', '2024-06-08', 130, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:33:31', '2024-06-08 21:33:31'),
(128, '08', '2024-06-08', 131, 1, 3, 2, 1, NULL, 1, '2024-06-08 21:38:25', '2024-06-08 21:38:25'),
(129, '05', '2024-06-08', 132, 1, 2, 2, 1, NULL, 1, '2024-06-08 22:02:16', '2024-06-08 22:02:16'),
(130, '23', '2024-06-08', 133, 1, 2, 2, 1, NULL, 1, '2024-06-08 22:08:19', '2024-06-08 22:08:19'),
(131, '15', '2024-06-08', 134, 1, 2, 2, 1, NULL, 1, '2024-06-08 22:14:01', '2024-06-08 22:14:01'),
(133, '13', '2024-06-08', 136, 1, 7, 3, 1, NULL, 1, '2024-06-08 22:25:16', '2024-06-08 22:25:16'),
(136, '27', '2024-06-09', 139, 1, 6, 3, 1, NULL, 1, '2024-06-09 14:27:05', '2024-06-09 14:27:05'),
(137, '11', '2024-06-09', 140, 1, 2, 2, 1, NULL, 1, '2024-06-09 14:33:52', '2024-06-09 14:33:52'),
(138, '07', '2024-06-09', 141, 1, 2, 2, 1, NULL, 1, '2024-06-09 14:38:13', '2024-06-09 14:38:13'),
(139, '10', '2024-06-09', 142, 1, 2, 2, 1, NULL, 1, '2024-06-09 14:42:19', '2024-06-09 14:42:19'),
(140, '15', '2024-06-09', 143, 1, 8, 4, 1, NULL, 1, '2024-06-09 14:49:15', '2024-06-09 14:49:15'),
(141, '17', '2024-06-09', 144, 1, 5, 3, 1, NULL, 1, '2024-06-09 14:52:56', '2024-06-09 14:52:56'),
(142, '36', '2024-06-09', 145, 1, 6, 3, 1, NULL, 1, '2024-06-09 14:58:49', '2024-06-09 14:58:49'),
(143, '08', '2024-06-09', 146, 1, 1, 1, 1, NULL, 1, '2024-06-09 15:03:11', '2024-06-09 15:03:11'),
(144, '15', '2024-06-09', 147, 1, 1, 1, 1, NULL, 1, '2024-06-09 15:11:29', '2024-06-09 15:11:29'),
(145, '07', '2024-06-09', 148, 2, 1, 1, 1, NULL, 1, '2024-06-09 15:17:11', '2024-06-09 15:17:11'),
(146, '05', '2024-06-09', 149, 2, 1, 1, 1, NULL, 1, '2024-06-09 15:22:32', '2024-06-09 15:22:32'),
(147, '30', '2024-06-09', 150, 2, 1, 1, 1, NULL, 1, '2024-06-09 15:52:46', '2024-06-09 15:52:46'),
(148, '21', '2024-06-09', 151, 2, 1, 1, 1, NULL, 1, '2024-06-09 15:57:13', '2024-06-09 15:57:13'),
(149, '02', '2024-06-09', 152, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:02:23', '2024-06-09 16:02:23'),
(151, '23', '2024-06-09', 154, 2, 1, 1, 1, NULL, 1, '2024-06-09 16:10:05', '2024-06-09 16:10:05'),
(152, '29', '2024-06-09', 155, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:10:07', '2024-06-09 16:10:07'),
(153, '36', '2024-06-09', 156, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:14:01', '2024-06-09 16:14:01'),
(154, '31', '2024-06-09', 157, 1, 11, 1, 1, NULL, 1, '2024-06-09 16:16:29', '2024-06-09 16:16:29'),
(155, '16', '2024-06-09', 158, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:21:15', '2024-06-09 16:21:15'),
(157, '23', '2024-06-09', 160, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:25:40', '2024-06-09 16:25:40'),
(158, '27', '2024-06-09', 161, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:28:48', '2024-06-09 16:28:48'),
(159, '36', '2024-06-09', 162, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:34:21', '2024-06-09 16:34:21'),
(160, '09', '2024-06-09', 163, 2, 10, 4, 1, NULL, 1, '2024-06-09 16:38:29', '2024-06-09 16:38:29'),
(161, '08', '2024-06-09', 164, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:41:46', '2024-06-09 16:41:46'),
(162, '09', '2024-06-09', 165, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:46:35', '2024-06-09 16:46:35'),
(163, '10', '2024-06-09', 166, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:50:23', '2024-06-09 16:50:23'),
(164, '22', '2024-06-09', 167, 1, 9, 4, 1, NULL, 1, '2024-06-09 16:58:35', '2024-06-09 16:58:35'),
(165, '00', '2024-06-09', 168, 1, 9, 4, 1, NULL, 1, '2024-06-09 23:50:07', '2024-06-09 23:50:07'),
(166, '08', '2024-06-09', 169, 1, 9, 4, 1, NULL, 1, '2024-06-09 23:54:56', '2024-06-09 23:54:56'),
(167, '26', '2024-06-09', 170, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:00:16', '2024-06-10 00:00:16'),
(168, '18', '2024-06-09', 171, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:06:13', '2024-06-10 00:06:13'),
(169, '30', '2024-06-09', 172, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:10:42', '2024-06-10 00:10:42'),
(170, '19', '2024-06-09', 173, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:16:26', '2024-06-10 00:16:26'),
(171, '25', '2024-06-09', 174, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:20:44', '2024-06-10 00:20:44'),
(172, '21', '2024-06-09', 175, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:25:40', '2024-06-10 00:25:40'),
(173, '03', '2024-06-09', 176, 2, 10, 4, 1, NULL, 1, '2024-06-10 00:29:52', '2024-06-10 00:29:52'),
(174, '01', '2024-06-09', 177, 1, 9, 4, 1, NULL, 1, '2024-06-10 00:35:13', '2024-06-10 00:35:13'),
(176, '33', '2024-06-09', 179, 1, 9, 4, 1, NULL, 1, '2024-06-10 01:01:02', '2024-06-10 01:01:02'),
(177, '01', '2024-06-11', 180, 1, 4, 2, 1, NULL, 1, '2024-06-11 12:56:45', '2024-06-11 12:56:45'),
(178, '12', '2024-06-11', 181, 1, 2, 2, 1, NULL, 1, '2024-06-11 13:12:15', '2024-06-11 13:12:15'),
(179, '23', '2024-06-11', 182, 1, 3, 2, 1, NULL, 1, '2024-06-11 13:21:31', '2024-06-11 13:21:31'),
(180, '29', '2024-06-11', 183, 1, 2, 2, 1, NULL, 1, '2024-06-11 13:42:06', '2024-06-11 13:42:06'),
(181, '02', '2024-06-11', 184, 1, 4, 2, 1, NULL, 1, '2024-06-11 13:52:25', '2024-06-11 13:52:25'),
(182, '01', '2024-06-11', 185, 1, 2, 2, 1, NULL, 1, '2024-06-11 14:06:38', '2024-06-11 14:06:38'),
(183, '03', '2024-06-11', 186, 2, 4, 2, 1, NULL, 1, '2024-06-11 14:13:29', '2024-06-11 14:13:29'),
(184, '06', '2024-06-11', 187, 2, 4, 2, 1, NULL, 1, '2024-06-11 14:16:57', '2024-06-11 14:16:57'),
(185, '13', '2024-06-11', 188, 2, 4, 2, 1, NULL, 1, '2024-06-11 14:21:07', '2024-06-11 14:21:07'),
(186, '14', '2024-06-11', 189, 2, 4, 2, 1, NULL, 1, '2024-06-11 14:29:31', '2024-06-11 14:29:31'),
(187, '04', '2024-06-11', 190, 1, 7, 3, 1, NULL, 1, '2024-06-11 15:48:45', '2024-06-11 15:48:45'),
(188, '47', '2024-06-11', 191, 1, 6, 3, 1, NULL, 1, '2024-06-11 15:56:39', '2024-06-11 15:56:39'),
(189, '28', '2024-06-11', 192, 1, 6, 3, 1, NULL, 1, '2024-06-11 16:21:39', '2024-06-11 16:21:39'),
(190, '17', '2024-06-11', 193, 2, 4, 2, 1, NULL, 1, '2024-06-11 16:25:51', '2024-06-11 16:25:51'),
(191, '09', '2024-06-11', 194, 1, 5, 3, 1, NULL, 1, '2024-06-11 16:32:09', '2024-06-11 16:32:09'),
(194, '03', '2024-06-11', 197, 1, 3, 2, 1, NULL, 1, '2024-06-11 16:47:29', '2024-06-11 16:47:29'),
(195, '17', '2024-06-11', 198, 1, 3, 2, 1, NULL, 1, '2024-06-11 16:51:15', '2024-06-11 16:51:15'),
(196, '35', '2024-06-11', 199, 1, 9, 4, 1, NULL, 1, '2024-06-11 16:55:34', '2024-06-11 16:55:34'),
(197, '13', '2024-06-11', 200, 1, 9, 4, 1, NULL, 1, '2024-06-11 17:00:11', '2024-06-11 17:00:11'),
(198, '04', '2024-06-11', 201, 1, 10, 4, 1, NULL, 1, '2024-06-11 17:04:33', '2024-06-11 17:04:33'),
(199, '05', '2024-06-11', 202, 1, 10, 4, 1, NULL, 1, '2024-06-11 17:08:45', '2024-06-11 17:08:45'),
(200, '39', '2024-06-11', 203, 1, 9, 4, 1, NULL, 1, '2024-06-11 17:12:38', '2024-06-11 17:12:38'),
(201, '40', '2024-06-11', 204, 1, 6, 3, 1, NULL, 1, '2024-06-11 17:16:38', '2024-06-11 17:16:38'),
(202, '08', '2024-06-11', 205, 1, 6, 3, 1, NULL, 1, '2024-06-11 17:20:58', '2024-06-11 17:20:58'),
(204, '17', '2024-06-11', 207, 1, 5, 3, 1, NULL, 1, '2024-06-11 17:34:44', '2024-06-11 17:34:44'),
(205, '20', '2024-06-11', 208, 1, 5, 3, 1, NULL, 1, '2024-06-11 17:39:10', '2024-06-11 17:39:10'),
(206, '24', '2024-06-11', 209, 1, 5, 3, 1, NULL, 1, '2024-06-11 17:43:54', '2024-06-11 17:43:54'),
(207, '23', '2024-06-11', 210, 1, 5, 3, 1, NULL, 1, '2024-06-11 17:48:20', '2024-06-11 17:48:20'),
(208, '06', '2024-06-11', 211, 1, 5, 3, 1, NULL, 1, '2024-06-11 17:51:53', '2024-06-11 17:51:53'),
(209, '41', '2024-06-11', 212, 1, 5, 3, 1, NULL, 1, '2024-06-11 17:56:04', '2024-06-11 17:56:04'),
(210, '13', '2024-06-11', 213, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:01:24', '2024-06-11 18:01:24'),
(211, '03', '2024-06-11', 214, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:04:52', '2024-06-11 18:04:52'),
(212, '10', '2024-06-11', 215, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:08:17', '2024-06-11 18:08:17'),
(213, '19', '2024-06-11', 216, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:11:23', '2024-06-11 18:11:23'),
(214, '21', '2024-06-11', 217, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:15:28', '2024-06-11 18:15:28'),
(215, '43', '2024-06-11', 218, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:20:03', '2024-06-11 18:20:03'),
(216, '07', '2024-06-11', 219, 1, 5, 3, 1, NULL, 1, '2024-06-11 18:24:14', '2024-06-11 18:24:14'),
(217, '19', '2024-06-11', 220, 1, 8, 4, 1, NULL, 1, '2024-06-11 18:28:19', '2024-06-11 18:28:19'),
(219, '09', '2024-06-12', 222, 1, 15, 7, 1, NULL, 1, '2024-06-12 12:23:07', '2024-06-12 12:23:07'),
(220, '03', '2024-06-12', 223, 1, 15, 7, 1, NULL, 1, '2024-06-12 12:35:16', '2024-06-12 12:35:16'),
(221, '12', '2024-06-12', 224, 1, 15, 7, 1, NULL, 1, '2024-06-12 12:39:10', '2024-06-27 18:48:50'),
(222, '08', '2024-06-12', 225, 1, 15, 7, 1, NULL, 1, '2024-06-12 12:43:14', '2024-06-27 18:49:30'),
(225, '10', '2024-06-12', 228, 1, 6, 3, 1, NULL, 1, '2024-06-12 16:55:12', '2024-06-12 16:55:12'),
(226, '08', '2024-06-12', 229, 2, 4, 2, 1, NULL, 1, '2024-06-12 16:58:50', '2024-06-12 16:58:50'),
(228, '10', '2024-06-12', 231, 1, 15, 7, 1, NULL, 1, '2024-06-12 17:17:14', '2024-06-27 18:49:38'),
(229, '30', '2024-06-12', 232, 1, 2, 1, 1, NULL, 1, '2024-06-12 17:22:42', '2024-06-12 17:22:42'),
(231, '22', '2024-06-12', 234, 1, 9, 4, 1, NULL, 1, '2024-06-12 18:03:17', '2024-06-12 18:03:17'),
(232, '02', '2024-06-12', 235, 2, 10, 3, 1, NULL, 1, '2024-06-12 18:07:36', '2024-06-12 18:07:36'),
(233, '14', '2024-06-12', 236, 1, 9, 4, 1, NULL, 1, '2024-06-12 18:12:33', '2024-06-12 18:12:33'),
(243, '08', '2024-06-13', 246, 1, 7, 3, 1, NULL, 1, '2024-06-13 13:39:39', '2024-06-13 13:39:39'),
(245, '03', '2024-06-20', 248, 2, 7, 3, 1, NULL, 1, '2024-06-20 08:52:19', '2024-06-20 08:52:19'),
(246, '10', '2024-06-20', 249, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:06:46', '2024-06-20 16:06:46'),
(247, '07', '2024-06-20', 250, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:12:03', '2024-06-20 16:12:03'),
(248, '06', '2024-06-20', 251, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:21:49', '2024-06-20 16:21:49'),
(249, '12', '2024-06-20', 252, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:27:10', '2024-06-20 16:27:10'),
(250, 'N/A', '2024-06-20', 253, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:32:06', '2024-06-20 16:32:06'),
(251, '05', '2024-06-20', 254, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:37:27', '2024-06-20 16:37:27'),
(252, '11', '2024-06-20', 255, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:43:12', '2024-06-20 16:43:12'),
(253, '42', '2024-06-20', 256, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:48:42', '2024-06-20 16:48:42'),
(254, '33', '2024-06-20', 257, 2, 7, 3, 1, NULL, 1, '2024-06-20 16:54:03', '2024-06-20 16:54:03'),
(255, '05', '2024-06-23', 258, 1, 7, 3, 1, NULL, 1, '2024-06-23 15:54:10', '2024-06-23 15:54:10'),
(256, '06', '2024-06-23', 259, 1, 6, 3, 1, NULL, 1, '2024-06-23 15:59:50', '2024-06-23 15:59:50'),
(257, '12', '2024-06-23', 260, 1, 6, 3, 1, NULL, 1, '2024-06-23 16:04:50', '2024-06-23 16:04:50'),
(258, '34', '2024-06-23', 261, 1, 6, 3, 1, NULL, 1, '2024-06-23 16:10:34', '2024-06-23 16:10:34'),
(262, '08', '2024-06-27', 265, 1, 7, 3, 1, NULL, 1, '2024-06-27 07:17:27', '2024-06-27 07:17:27'),
(263, '34', '2024-06-27', 266, 1, 1, 1, 1, NULL, 1, '2024-06-27 07:23:09', '2024-06-27 07:23:09'),
(266, '19', '2024-06-29', 269, 2, 1, 1, 1, NULL, 1, '2024-06-29 17:29:08', '2024-06-29 17:29:08'),
(271, '16', '2024-06-30', 274, 2, 1, 1, 1, NULL, 1, '2024-06-30 08:17:02', '2024-06-30 08:17:02'),
(272, '24', '2024-06-30', 275, 2, 1, 1, 1, NULL, 1, '2024-06-30 08:21:49', '2024-06-30 08:21:49'),
(280, '26', '2024-06-30', 283, 2, 1, 1, 1, NULL, 1, '2024-06-30 09:22:38', '2024-06-30 09:22:38'),
(281, '18', '2024-06-30', 284, 2, 1, 1, 1, NULL, 1, '2024-06-30 09:28:46', '2024-06-30 09:28:46'),
(285, '31', '2024-06-30', 288, 1, 1, 1, 1, NULL, 1, '2024-06-30 10:00:26', '2024-06-30 10:00:26'),
(296, '09', '2024-06-30', 300, 1, 1, 1, 1, NULL, 1, '2024-06-30 11:07:58', '2024-06-30 11:07:58'),
(297, '13', '2024-07-01', 301, 1, 1, 1, 1, NULL, 1, '2024-07-01 04:26:32', '2024-07-01 04:26:32'),
(298, '25', '2024-07-01', 302, 1, 1, 1, 1, NULL, 1, '2024-07-01 04:32:47', '2024-07-01 04:32:47'),
(300, '10', '2024-07-01', 304, 1, 8, 4, 1, NULL, 1, '2024-07-01 04:39:10', '2024-07-01 04:39:10'),
(301, '04', '2024-07-01', 305, 1, 2, 2, 1, NULL, 1, '2024-07-01 04:44:31', '2024-07-01 04:44:31'),
(302, '12', '2024-07-01', 306, 2, 4, 2, 1, NULL, 1, '2024-07-01 04:47:38', '2024-07-01 04:47:38'),
(303, '18', '2024-07-01', 307, 2, 4, 2, 1, NULL, 1, '2024-07-01 04:51:24', '2024-07-01 04:51:24'),
(304, '29', '2024-07-01', 308, 2, 5, 3, 1, NULL, 1, '2024-07-01 04:56:52', '2024-07-01 04:56:52'),
(305, '11', '2024-07-01', 309, 1, 5, 3, 1, NULL, 1, '2024-07-01 05:01:00', '2024-07-01 05:01:00'),
(309, 'N/A', '2024-07-01', 313, 2, 1, 1, 1, NULL, 1, '2024-07-01 10:10:43', '2024-07-01 10:10:43'),
(310, '32', '2024-07-01', 314, 1, 6, 3, 1, NULL, 1, '2024-07-01 10:15:25', '2024-07-01 10:15:25'),
(311, '07', '2024-07-01', 315, 2, 4, 2, 1, NULL, 1, '2024-07-01 10:18:38', '2024-07-01 10:18:38'),
(333, '05', '2024-07-02', 337, 1, 4, 3, 1, NULL, 1, '2024-07-02 10:20:37', '2024-07-02 10:20:37'),
(355, '26', '2024-07-03', 359, 1, 2, 2, 1, NULL, 1, '2024-07-03 07:28:42', '2024-07-03 07:28:42'),
(357, '28', '2024-07-04', 361, 1, 2, 2, 1, NULL, 1, '2024-07-04 09:25:12', '2024-07-04 09:25:12'),
(358, '16', '2024-07-04', 362, 2, 4, 2, 1, NULL, 1, '2024-07-04 09:33:03', '2024-07-04 09:33:03'),
(359, '13', '2024-07-07', 363, 1, 8, 4, 1, NULL, 1, '2024-07-07 08:31:47', '2024-07-07 08:31:47'),
(360, '35', '2024-07-07', 364, 1, 6, 3, 1, NULL, 1, '2024-07-07 17:53:06', '2024-07-07 17:53:06'),
(362, '16', '2024-07-10', 366, 1, 8, 4, 1, NULL, 1, '2024-07-10 07:49:00', '2024-07-10 07:49:00'),
(363, '09', '2024-07-10', 367, 1, 6, 3, 1, NULL, 1, '2024-07-10 07:53:29', '2024-07-10 07:53:29'),
(364, '24', '2024-07-10', 368, 1, 6, 3, 1, NULL, 1, '2024-07-10 07:56:38', '2024-07-10 07:56:38'),
(365, '20', '2024-07-10', 369, 1, 8, 4, 1, NULL, 1, '2024-07-10 08:01:14', '2024-07-10 08:01:14'),
(366, '19', '2024-07-10', 370, 1, 2, 2, 1, NULL, 1, '2024-07-10 08:08:04', '2024-07-10 08:08:04'),
(367, '22', '2024-07-11', 371, 1, 2, 2, 1, NULL, 1, '2024-07-11 08:37:08', '2024-07-11 08:37:08'),
(368, '03', '2024-07-11', 372, 1, 2, 2, 1, NULL, 1, '2024-07-11 08:44:06', '2024-07-11 08:44:06'),
(369, '04', '2024-07-14', 373, 2, 4, 2, 1, NULL, 1, '2024-07-14 09:58:05', '2024-07-14 09:58:05'),
(370, '24', '2024-07-14', 374, 1, 2, 2, 1, NULL, 1, '2024-07-14 10:01:16', '2024-07-14 10:01:16'),
(371, '24', '2024-07-14', 375, 1, 8, 4, 1, NULL, 1, '2024-07-14 10:05:09', '2024-07-14 10:05:09'),
(372, '04', '2024-07-14', 376, 1, 5, 3, 1, NULL, 1, '2024-07-14 10:09:50', '2024-07-14 10:09:50'),
(373, '11', '2024-07-16', 377, 1, 4, 2, 1, NULL, 1, '2024-07-16 09:59:37', '2024-07-16 09:59:37'),
(374, '40', '2024-07-16', 378, 2, 1, 1, 1, NULL, 1, '2024-07-16 10:04:08', '2024-07-16 10:04:08'),
(375, '08', '2024-07-25', 379, 1, 3, 2, 1, NULL, 1, '2024-07-25 11:24:29', '2024-07-25 11:24:29'),
(376, '12', '2024-07-25', 380, 1, 3, 2, 1, NULL, 1, '2024-07-25 11:27:59', '2024-07-25 11:27:59'),
(377, '22', '2024-07-27', 381, 1, 3, 2, 1, NULL, 1, '2024-07-27 16:16:02', '2024-07-27 16:16:02'),
(378, '31', '2024-07-27', 382, 1, 2, 2, 1, NULL, 1, '2024-07-27 16:21:42', '2024-07-27 16:21:42'),
(379, '15', '2024-07-28', 383, 1, 3, 2, 1, NULL, 1, '2024-07-28 05:32:57', '2024-07-28 05:32:57'),
(380, '35', '2024-07-30', 384, 1, 6, 3, 1, NULL, 1, '2024-07-30 08:01:24', '2024-07-30 08:01:24'),
(381, '16', '2024-08-04', 385, 2, 7, 3, 1, NULL, 1, '2024-08-04 06:34:11', '2024-08-04 06:34:11'),
(382, '25', '2024-08-06', 386, 1, 6, 3, 1, NULL, 1, '2024-08-06 17:03:35', '2024-08-06 17:03:35'),
(383, '19', '2024-08-06', 387, 1, 6, 3, 1, NULL, 1, '2024-08-06 17:08:11', '2024-08-06 17:08:11'),
(384, '44', '2024-08-06', 388, 1, 6, 3, 1, NULL, 1, '2024-08-06 17:12:03', '2024-08-06 17:12:03'),
(385, '18', '2024-08-14', 389, 1, 6, 3, 1, NULL, 1, '2024-08-14 08:36:25', '2024-08-14 08:36:25'),
(386, '30', '2024-08-14', 390, 1, 6, 3, 1, NULL, 1, '2024-08-14 08:43:43', '2024-08-14 08:43:43'),
(387, '21', '2024-08-14', 391, 1, 6, 3, 1, NULL, 1, '2024-08-14 08:49:25', '2024-08-14 08:49:25'),
(389, '06', '2024-08-14', 393, 1, 9, 4, 1, NULL, 1, '2024-08-14 08:59:33', '2024-08-14 08:59:33'),
(390, '03', '2024-08-14', 394, 1, 9, 4, 1, NULL, 1, '2024-08-14 09:05:51', '2024-08-14 09:05:51'),
(391, '46', '2024-08-14', 395, 1, 6, 3, 1, NULL, 1, '2024-08-14 09:10:47', '2024-08-14 09:10:47'),
(392, '01', '2024-08-14', 396, 2, 7, 3, 1, NULL, 1, '2024-08-14 09:14:41', '2024-08-14 09:14:41'),
(394, '09', '2024-08-14', 398, 2, 7, 3, 1, NULL, 1, '2024-08-14 09:38:32', '2024-08-14 09:38:32'),
(395, '15', '2024-08-14', 399, 2, 7, 3, 1, NULL, 1, '2024-08-14 09:43:07', '2024-08-14 09:43:07'),
(396, 'N/A', '2024-08-14', 400, 1, 9, 4, 1, NULL, 1, '2024-08-14 09:47:59', '2024-08-14 09:47:59'),
(397, '48', '2024-08-14', 401, 1, 6, 3, 1, NULL, 1, '2024-08-14 09:54:36', '2024-08-14 09:54:36'),
(398, '02', '2024-08-19', 402, 1, 5, 3, 1, NULL, 1, '2024-08-19 09:23:12', '2024-08-19 09:23:12'),
(399, '26', '2024-08-19', 403, 1, 5, 3, 1, NULL, 1, '2024-08-19 09:28:37', '2024-08-19 09:28:37'),
(401, '27', '2024-08-20', 405, 1, 5, 3, 1, NULL, 1, '2024-08-20 04:51:02', '2024-08-20 04:51:02'),
(402, '41', '2024-08-20', 406, 2, 1, 1, 1, NULL, 1, '2024-08-20 04:59:14', '2024-08-20 04:59:14'),
(403, '15', '2024-08-21', 407, 1, 5, 3, 1, NULL, 1, '2024-08-21 04:46:20', '2024-08-21 04:46:20'),
(404, '26', '2024-08-21', 408, 1, 8, 4, 1, NULL, 1, '2024-08-21 04:57:18', '2024-08-21 04:57:18'),
(407, '37', '2024-08-31', 411, 2, 1, 1, 1, NULL, 1, '2024-08-31 16:05:53', '2024-08-31 16:05:53'),
(408, '47', '2024-08-31', 412, 2, 1, 1, 1, NULL, 1, '2024-08-31 16:16:20', '2024-08-31 16:16:20'),
(412, '29', '2024-08-31', 416, 2, 1, 1, 1, NULL, 1, '2024-08-31 16:36:29', '2024-08-31 16:36:29'),
(414, '14', '2024-09-02', 418, 2, 7, 3, 1, NULL, 1, '2024-09-02 01:38:40', '2024-09-02 01:38:40'),
(415, '41', '2024-09-02', 419, 1, 11, 5, 1, NULL, 1, '2024-09-02 01:43:56', '2024-09-02 01:43:56'),
(416, '22', '2024-09-02', 420, 1, 9, 4, 1, NULL, 1, '2024-09-02 01:51:00', '2024-09-02 01:51:00'),
(418, '02', '2024-09-02', 422, 1, 2, 2, 1, NULL, 1, '2024-09-02 02:00:20', '2024-09-02 02:00:20'),
(420, '01', '2024-10-06', 424, 1, 5, 3, 1, NULL, 1, '2024-10-05 21:48:10', '2024-10-05 21:48:10'),
(422, 'N/A', '2025-01-21', 426, 1, 2, 2, 1, NULL, 1, '2025-01-21 03:22:30', '2025-01-21 03:22:30'),
(423, 'N/A', '2025-01-21', 428, 2, 10, 4, 1, NULL, 1, '2025-01-21 05:19:50', '2025-01-21 05:19:50'),
(426, 'N/A', '2025-01-21', 431, 1, 2, 2, 1, NULL, 1, '2025-01-21 06:19:34', '2025-01-21 06:19:34'),
(427, 'N/A', '2025-01-21', 432, 1, 6, 3, 1, NULL, 1, '2025-01-21 06:56:06', '2025-01-21 06:56:06'),
(428, 'N/A', '2025-01-21', 433, 1, 1, 1, 1, NULL, 1, '2025-01-21 07:06:48', '2025-01-21 07:06:48'),
(429, 'N/A', '2025-01-21', 434, 1, 6, 3, 1, NULL, 1, '2025-01-21 07:14:07', '2025-01-21 07:14:07'),
(430, 'N/A', '2025-01-21', 435, 1, 4, 3, 1, NULL, 1, '2025-01-21 07:19:35', '2025-01-21 07:19:35'),
(431, 'N/A', '2025-01-21', 436, 1, 6, 3, 1, NULL, 1, '2025-01-21 07:31:02', '2025-01-21 07:31:02'),
(432, 'N/A', '2025-01-21', 437, 1, 5, 3, 1, NULL, 1, '2025-01-21 07:38:01', '2025-01-21 07:38:01'),
(434, 'N/A', '2025-01-21', 439, 1, 2, 2, 1, NULL, 1, '2025-01-21 07:56:47', '2025-01-21 07:56:47'),
(435, 'N/A', '2025-01-21', 440, 1, 1, 1, 1, NULL, 1, '2025-01-21 08:05:19', '2025-01-21 08:05:19'),
(436, 'N/A', '2025-01-21', 441, 1, 6, 3, 1, NULL, 1, '2025-01-21 08:11:12', '2025-01-21 08:11:12'),
(437, 'N/A', '2025-01-22', 442, 1, 12, 5, 1, NULL, 1, '2025-01-21 20:46:36', '2025-01-21 20:46:36'),
(439, 'N/A', '2025-01-22', 444, 1, 2, 2, 1, NULL, 1, '2025-01-21 20:57:10', '2025-01-21 20:57:10'),
(440, 'N/A', '2025-01-22', 445, 1, 6, 3, 1, NULL, 1, '2025-01-21 21:24:13', '2025-01-21 21:24:13'),
(443, 'N/A', '2025-01-22', 448, 1, 1, 1, 1, NULL, 1, '2025-01-21 23:57:36', '2025-01-21 23:59:36'),
(444, 'N/A', '2025-01-22', 449, 2, 1, 1, 1, NULL, 1, '2025-01-22 00:04:15', '2025-01-22 00:04:15'),
(445, 'N/A', '2025-01-22', 450, 2, 1, 1, 1, NULL, 1, '2025-01-22 00:10:50', '2025-01-22 00:10:50'),
(446, 'N/A', '2025-01-22', 451, 2, 7, 3, 1, NULL, 1, '2025-01-22 00:20:09', '2025-01-22 00:20:09'),
(447, 'N/A', '2025-01-22', 452, 1, 3, 2, 1, NULL, 1, '2025-01-22 00:24:18', '2025-01-22 00:24:18'),
(448, 'N/A', '2025-01-22', 453, 1, 5, 3, 1, NULL, 1, '2025-01-22 00:29:21', '2025-01-22 00:29:21'),
(449, 'N/A', '2025-01-22', 454, 1, 3, 2, 1, NULL, 1, '2025-01-22 00:33:22', '2025-01-22 00:33:22'),
(450, 'N/A', '2025-01-22', 455, 2, 1, 1, 1, NULL, 1, '2025-01-22 00:38:08', '2025-01-22 00:38:08'),
(452, 'N/A', '2025-01-22', 457, 1, 6, 3, 1, NULL, 1, '2025-01-22 01:23:12', '2025-01-22 01:23:12'),
(453, 'N/A', '2025-01-22', 458, 1, 5, 3, 1, NULL, 1, '2025-01-22 01:27:46', '2025-01-22 01:27:46'),
(454, 'N/A', '2025-01-22', 459, 2, 7, 2, 1, NULL, 1, '2025-01-22 01:35:22', '2025-01-22 01:35:22'),
(455, 'N/A', '2025-01-22', 460, 1, 8, 4, 1, NULL, 1, '2025-01-22 01:43:47', '2025-01-22 01:43:47'),
(456, 'N/A', '2025-01-22', 461, 1, 8, 4, 1, NULL, 1, '2025-01-22 01:50:57', '2025-01-22 01:50:57'),
(457, 'N/A', '2025-01-22', 462, 1, 6, 3, 1, NULL, 1, '2025-01-22 01:56:51', '2025-01-22 01:56:51'),
(458, 'N/A', '2025-01-22', 463, 2, 1, 1, 1, NULL, 1, '2025-01-22 02:02:12', '2025-01-22 02:02:12'),
(459, 'N/A', '2025-01-23', 464, 1, 3, 2, 1, NULL, 1, '2025-01-22 20:44:11', '2025-01-22 20:44:11'),
(460, 'N/A', '2025-01-23', 465, 1, 2, 2, 1, NULL, 1, '2025-01-22 20:59:07', '2025-01-22 20:59:07'),
(461, 'N/A', '2025-01-23', 466, 1, 3, 2, 1, NULL, 1, '2025-01-22 21:02:41', '2025-01-22 21:02:41'),
(462, 'N/A', '2025-01-23', 467, 2, 1, 1, 1, NULL, 1, '2025-01-22 21:05:46', '2025-01-22 21:05:46'),
(464, 'N/A', '2025-01-23', 469, 1, 6, 3, 1, NULL, 1, '2025-01-22 21:13:32', '2025-01-22 21:13:32'),
(466, 'N/A', '2025-01-23', 471, 1, 6, 3, 1, NULL, 1, '2025-01-22 21:22:56', '2025-01-22 21:22:56'),
(467, 'N/A', '2025-01-23', 472, 2, 4, 2, 1, NULL, 1, '2025-01-22 21:28:52', '2025-01-22 21:28:52'),
(468, 'N/A', '2025-01-23', 473, 1, 3, 2, 1, NULL, 1, '2025-01-23 00:10:34', '2025-01-23 00:10:34'),
(470, 'N/A', '2025-01-23', 475, 1, 5, 2, 1, NULL, 1, '2025-01-23 00:27:56', '2025-01-23 00:27:56'),
(471, 'N/A', '2025-01-23', 476, 2, 4, 2, 1, NULL, 1, '2025-01-23 00:36:49', '2025-01-23 00:36:49'),
(472, 'N/A', '2025-01-23', 477, 2, 7, 3, 1, NULL, 1, '2025-01-23 00:41:09', '2025-01-23 00:41:09'),
(473, 'N/A', '2025-01-23', 478, 1, 8, 4, 1, NULL, 1, '2025-01-23 00:44:48', '2025-01-23 00:44:48'),
(474, 'N/A', '2025-01-23', 479, 1, 3, 2, 1, NULL, 1, '2025-01-23 00:49:45', '2025-01-23 00:49:45'),
(475, 'N/A', '2025-01-23', 480, 2, 1, 1, 1, NULL, 1, '2025-01-23 00:54:05', '2025-01-23 00:54:05'),
(476, 'N/A', '2025-01-23', 481, 1, 7, 3, 1, NULL, 1, '2025-01-23 00:58:05', '2025-01-23 00:58:05'),
(477, 'N/A', '2025-01-23', 482, 1, 2, 2, 1, NULL, 1, '2025-01-23 01:03:36', '2025-01-23 01:03:36'),
(478, 'N/A', '2025-01-23', 483, 1, 2, 2, 1, NULL, 1, '2025-01-23 01:12:04', '2025-01-23 01:12:04'),
(479, 'N/A', '2025-01-23', 484, 1, 2, 2, 1, NULL, 1, '2025-01-23 01:45:54', '2025-01-23 01:45:54'),
(480, 'N/A', '2025-01-26', 485, 1, 2, 2, 1, NULL, 1, '2025-01-25 20:22:50', '2025-01-25 20:22:50'),
(481, 'N/A', '2025-01-26', 486, 1, 2, 2, 1, NULL, 1, '2025-01-25 20:30:40', '2025-01-25 20:30:40'),
(482, 'N/A', '2025-01-26', 487, 1, 3, 2, 1, NULL, 1, '2025-01-25 20:35:00', '2025-01-25 20:35:00'),
(483, 'N/A', '2025-01-26', 488, 1, 3, 1, 1, NULL, 1, '2025-01-25 20:39:09', '2025-01-25 20:39:09'),
(484, 'N/A', '2025-01-26', 489, 1, 3, 2, 1, NULL, 1, '2025-01-25 20:48:28', '2025-01-25 20:48:28'),
(485, 'N/A', '2025-01-26', 490, 1, 6, 3, 1, NULL, 1, '2025-01-25 20:54:48', '2025-01-25 20:54:48'),
(486, 'N/A', '2025-01-26', 491, 1, 2, 2, 1, NULL, 1, '2025-01-25 20:58:42', '2025-01-25 20:58:42'),
(487, 'N/A', '2025-01-26', 492, 1, 2, 2, 1, NULL, 1, '2025-01-25 21:19:44', '2025-01-25 21:19:44'),
(488, 'N/A', '2025-01-26', 493, 1, 6, 3, 1, NULL, 1, '2025-01-25 21:23:31', '2025-01-25 21:23:31'),
(489, 'N/A', '2025-01-26', 494, 1, 4, 2, 1, NULL, 1, '2025-01-26 00:19:45', '2025-01-26 00:19:45'),
(490, 'N/A', '2025-01-26', 495, 1, 1, 1, 1, NULL, 1, '2025-01-26 00:25:36', '2025-01-26 00:25:36'),
(491, 'N/A', '2025-01-26', 496, 1, 2, 2, 1, NULL, 1, '2025-01-26 00:33:12', '2025-01-26 00:33:12'),
(492, 'N/A', '2025-01-26', 497, 1, 5, 3, 1, NULL, 1, '2025-01-26 00:37:20', '2025-01-26 00:37:20'),
(493, 'N/A', '2025-01-26', 498, 2, 1, 1, 1, NULL, 1, '2025-01-26 00:43:51', '2025-01-26 00:43:51'),
(494, 'N/A', '2025-01-26', 499, 2, 7, 3, 1, NULL, 1, '2025-01-26 00:48:08', '2025-01-26 00:48:08'),
(495, 'N/A', '2025-01-26', 500, 2, 7, 3, 1, NULL, 1, '2025-01-26 00:55:51', '2025-01-26 00:55:51'),
(496, 'N/A', '2025-01-26', 501, 1, 6, 3, 1, NULL, 1, '2025-01-26 01:00:51', '2025-01-26 01:00:51'),
(497, 'N/A', '2025-01-26', 502, 1, 2, 2, 1, NULL, 1, '2025-01-26 01:28:26', '2025-01-26 01:28:26'),
(498, 'N/A', '2025-01-26', 503, 1, 8, 4, 1, NULL, 1, '2025-01-26 01:38:02', '2025-01-26 01:38:02'),
(499, 'N/A', '2025-01-26', 504, 1, 6, 3, 1, NULL, 1, '2025-01-26 01:43:49', '2025-01-26 01:43:49'),
(500, 'N/A', '2025-01-27', 505, 1, 6, 3, 1, NULL, 1, '2025-01-26 20:49:58', '2025-01-26 20:49:58'),
(501, 'N/A', '2025-01-27', 506, 2, 1, 1, 1, NULL, 1, '2025-01-26 20:52:55', '2025-01-26 20:52:55'),
(502, 'N/A', '2025-01-27', 507, 1, 3, 2, 1, NULL, 1, '2025-01-26 20:57:14', '2025-01-26 20:57:14'),
(503, 'N/A', '2025-01-27', 508, 1, 8, 4, 1, NULL, 1, '2025-01-26 21:26:32', '2025-01-26 21:26:32'),
(504, 'N/A', '2025-01-27', 509, 2, 4, 2, 1, NULL, 1, '2025-01-26 21:31:15', '2025-01-26 21:31:15'),
(505, 'N/A', '2025-01-27', 510, 1, 3, 2, 1, NULL, 1, '2025-01-26 23:54:36', '2025-01-26 23:54:36'),
(506, 'N/A', '2025-01-27', 511, 1, 6, 3, 1, NULL, 1, '2025-01-27 00:02:58', '2025-01-27 00:02:58'),
(507, 'N/A', '2025-01-27', 512, 2, 7, 3, 1, NULL, 1, '2025-01-27 00:07:49', '2025-01-27 00:07:49'),
(508, 'N/A', '2025-01-27', 513, 1, 8, 4, 1, NULL, 1, '2025-01-27 00:40:15', '2025-01-27 00:40:15'),
(509, 'N/A', '2025-01-27', 514, 1, 9, 4, 1, NULL, 1, '2025-01-27 00:52:44', '2025-01-27 00:52:44'),
(510, 'N/A', '2025-01-27', 515, 2, 1, 1, 1, NULL, 1, '2025-01-27 00:55:42', '2025-01-27 00:55:42'),
(511, 'N/A', '2025-01-27', 516, 1, 5, 3, 1, NULL, 1, '2025-01-27 00:58:56', '2025-01-27 00:58:56'),
(512, 'N/A', '2025-01-27', 517, 1, 5, 3, 1, NULL, 1, '2025-01-27 01:05:15', '2025-01-27 01:05:15'),
(515, 'N/A', '2025-01-27', 520, 1, 6, 3, 1, NULL, 1, '2025-01-27 01:17:02', '2025-01-27 01:17:02'),
(516, 'N/A', '2025-01-27', 521, 1, 9, 4, 1, NULL, 1, '2025-01-27 01:20:35', '2025-01-27 01:20:35'),
(517, 'N/A', '2025-02-04', 522, 1, 12, 1, 1, NULL, 1, '2025-02-03 21:35:40', '2025-02-03 21:35:40'),
(518, 'N/A', '2025-02-10', 523, 1, 5, 1, 1, NULL, 1, '2025-02-10 00:31:42', '2025-02-10 00:31:42'),
(520, 'N/A', '2025-02-12', 525, 1, 8, 4, 1, NULL, 1, '2025-02-11 20:50:05', '2025-02-11 20:50:05'),
(521, 'N/A', '2025-02-12', 526, 1, 2, 2, 1, NULL, 1, '2025-02-11 21:13:58', '2025-02-11 21:13:58'),
(522, 'N/A', '2025-05-27', 527, 1, 1, 1, 1, NULL, 1, '2025-05-27 02:02:59', '2025-05-27 02:02:59'),
(523, 'N/A', '2025-05-27', 528, 1, 5, 3, 1, NULL, 1, '2025-05-27 02:06:28', '2025-05-27 02:06:28'),
(524, 'N/A', '2026-02-23', 529, 1, 2, 1, 1, NULL, 1, '2026-02-23 00:20:30', '2026-02-23 00:20:30'),
(525, 'N/A', '2026-02-23', 531, 1, 2, 2, 1, NULL, 1, '2026-02-23 00:37:41', '2026-02-23 00:37:41'),
(526, 'N/A', '2026-02-23', 532, 1, 4, 1, 1, NULL, 1, '2026-02-23 00:43:42', '2026-02-23 00:43:42'),
(527, 'N/A', '2026-02-23', 533, 1, 4, 2, 1, NULL, 1, '2026-02-23 00:51:03', '2026-02-23 00:51:03'),
(528, 'N/A', '2026-02-23', 534, 1, 4, 1, 1, NULL, 1, '2026-02-23 00:56:04', '2026-02-23 00:56:04'),
(529, 'N/A', '2026-02-23', 535, 1, 4, 2, 1, NULL, 1, '2026-02-23 01:01:28', '2026-02-23 01:01:28'),
(530, 'N/A', '2026-02-23', 536, 1, 2, 2, 1, NULL, 1, '2026-02-23 01:06:24', '2026-02-23 01:06:24'),
(531, 'N/A', '2026-02-23', 537, 1, 2, 2, 1, NULL, 1, '2026-02-23 01:11:09', '2026-02-23 01:11:09'),
(532, 'N/A', '2026-02-23', 538, 1, 2, 2, 1, NULL, 1, '2026-02-23 01:17:14', '2026-02-23 01:17:14'),
(533, 'N/A', '2026-02-23', 539, 1, 2, 2, 1, NULL, 1, '2026-02-23 01:27:49', '2026-02-23 01:27:49'),
(534, 'N/A', '2026-02-23', 540, 1, 2, 2, 1, NULL, 1, '2026-02-23 01:33:43', '2026-02-23 01:33:43'),
(535, 'N/A', '2026-03-05', 541, 1, 2, 2, 1, NULL, 1, '2026-03-04 20:57:14', '2026-03-04 20:57:14'),
(536, 'N/A', '2026-03-05', 542, 1, 2, 2, 1, NULL, 1, '2026-03-04 21:03:49', '2026-03-04 21:03:49'),
(537, 'N/A', '2026-03-05', 543, 1, 2, 2, 1, NULL, 1, '2026-03-04 21:07:47', '2026-03-04 21:07:47'),
(538, 'N/A', '2026-03-05', 544, 1, 2, 2, 1, NULL, 1, '2026-03-04 21:12:17', '2026-03-04 21:12:17'),
(539, 'N/A', '2026-03-05', 545, 1, 3, 2, 1, NULL, 1, '2026-03-04 22:39:05', '2026-03-04 22:39:05'),
(540, 'N/A', '2026-03-05', 546, 1, 3, 2, 1, NULL, 1, '2026-03-04 22:44:00', '2026-03-04 22:44:00'),
(541, 'N/A', '2026-03-05', 547, 1, 3, 2, 1, NULL, 1, '2026-03-04 22:57:14', '2026-03-04 22:57:14'),
(542, 'N/A', '2026-03-05', 548, 1, 3, 2, 1, NULL, 1, '2026-03-04 23:07:51', '2026-03-04 23:07:51'),
(543, 'N/A', '2026-03-05', 549, 1, 3, 2, 1, NULL, 1, '2026-03-04 23:12:41', '2026-03-04 23:12:41'),
(544, 'N/A', '2026-03-08', 550, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:04:18', '2026-03-07 21:04:18'),
(545, 'N/A', '2026-03-08', 551, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:07:53', '2026-03-07 21:07:53'),
(546, 'N/A', '2026-03-08', 552, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:11:55', '2026-03-07 21:11:55'),
(547, 'N/A', '2026-03-08', 553, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:16:02', '2026-03-07 21:16:02'),
(548, 'N/A', '2026-03-08', 554, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:19:57', '2026-03-07 21:19:57'),
(549, 'N/A', '2026-03-08', 555, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:25:17', '2026-03-07 21:25:17'),
(550, 'N/A', '2026-03-08', 556, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:29:00', '2026-03-07 21:29:00'),
(551, 'N/A', '2026-03-08', 557, 1, 2, 2, 1, NULL, 1, '2026-03-07 21:33:45', '2026-03-07 21:33:45'),
(552, 'N/A', '2026-03-08', 558, 1, 2, 2, 1, NULL, 1, '2026-03-07 21:37:28', '2026-03-07 21:37:28'),
(553, 'N/A', '2026-03-08', 559, 1, 2, 2, 1, NULL, 1, '2026-03-07 21:40:28', '2026-03-07 21:40:28'),
(554, 'N/A', '2026-03-08', 560, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:44:03', '2026-03-07 21:44:03'),
(555, 'N/A', '2026-03-08', 561, 1, 3, 2, 1, NULL, 1, '2026-03-07 21:47:29', '2026-03-07 21:47:29'),
(556, 'N/A', '2026-03-08', 562, 1, 2, 2, 1, NULL, 1, '2026-03-07 21:58:27', '2026-03-07 21:58:27'),
(557, 'N/A', '2026-03-08', 563, 1, 4, 2, 1, NULL, 1, '2026-03-07 22:02:27', '2026-03-07 22:02:27'),
(558, 'N/A', '2026-03-08', 564, 1, 4, 2, 1, NULL, 1, '2026-03-07 22:07:11', '2026-03-07 22:07:11'),
(559, 'N/A', '2026-03-08', 565, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:13:20', '2026-03-07 22:13:20'),
(560, 'N/A', '2026-03-08', 566, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:17:46', '2026-03-07 22:17:46'),
(561, 'N/A', '2026-03-08', 567, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:21:06', '2026-03-07 22:21:06'),
(562, 'N/A', '2026-03-08', 568, 1, 2, 1, 1, NULL, 1, '2026-03-07 22:24:13', '2026-03-07 22:24:13'),
(563, 'N/A', '2026-03-08', 569, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:37:50', '2026-03-07 22:37:50'),
(564, 'N/A', '2026-03-08', 570, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:42:39', '2026-03-07 22:42:39'),
(565, 'N/A', '2026-03-08', 571, 1, 3, 2, 1, NULL, 1, '2026-03-07 22:47:06', '2026-03-07 22:47:06'),
(566, 'N/A', '2026-03-08', 572, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:50:25', '2026-03-07 22:50:25'),
(567, 'N/A', '2026-03-08', 573, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:53:27', '2026-03-07 22:53:27'),
(568, 'N/A', '2026-03-08', 574, 1, 2, 2, 1, NULL, 1, '2026-03-07 22:57:05', '2026-03-07 22:57:05'),
(569, 'N/A', '2026-03-08', 575, 1, 2, 2, 1, NULL, 1, '2026-03-07 23:01:10', '2026-03-07 23:01:10'),
(570, 'N/A', '2026-03-08', 576, 1, 4, 2, 1, NULL, 1, '2026-03-07 23:06:33', '2026-03-07 23:06:33'),
(571, 'N/A', '2026-03-08', 577, 1, 3, 2, 1, NULL, 1, '2026-03-08 00:53:50', '2026-03-08 00:53:50'),
(572, 'N/A', '2026-03-08', 578, 1, 3, 2, 1, NULL, 1, '2026-03-08 00:57:35', '2026-03-08 00:57:35'),
(573, 'N/A', '2026-03-08', 579, 1, 3, 2, 1, NULL, 1, '2026-03-08 01:01:47', '2026-03-08 01:01:47'),
(574, 'N/A', '2026-03-09', 580, 1, 3, 2, 1, NULL, 1, '2026-03-08 21:25:40', '2026-03-08 21:25:40'),
(575, 'N/A', '2026-03-09', 581, 1, 3, 2, 1, NULL, 1, '2026-03-08 21:29:18', '2026-03-08 21:29:18'),
(576, 'N/A', '2026-03-09', 582, 1, 3, 2, 1, NULL, 1, '2026-03-08 21:33:38', '2026-03-08 21:33:38'),
(577, 'N/A', '2026-03-09', 583, 1, 2, 2, 1, NULL, 1, '2026-03-08 21:41:55', '2026-03-08 21:41:55'),
(578, 'N/A', '2026-03-09', 584, 1, 1, 1, 1, NULL, 1, '2026-03-08 21:47:30', '2026-03-08 21:47:30'),
(579, 'N/A', '2026-03-09', 585, 1, 8, 4, 1, NULL, 1, '2026-03-08 21:51:58', '2026-03-08 21:51:58'),
(580, 'N/A', '2026-03-09', 586, 1, 9, 4, 1, NULL, 1, '2026-03-08 21:56:42', '2026-03-08 21:56:42'),
(581, 'N/A', '2026-03-09', 587, 1, 15, 7, 1, NULL, 1, '2026-03-08 22:00:00', '2026-03-08 22:00:00'),
(582, 'N/A', '2026-03-09', 588, 1, 1, 1, 1, NULL, 1, '2026-03-08 22:06:03', '2026-03-08 22:06:03'),
(583, 'N/A', '2026-03-09', 589, 1, 5, 4, 1, NULL, 1, '2026-03-08 22:10:10', '2026-03-08 22:10:10'),
(584, 'N/A', '2026-03-09', 590, 1, 6, 3, 1, NULL, 1, '2026-03-09 00:00:50', '2026-03-09 00:00:50'),
(585, 'N/A', '2026-03-09', 591, 1, 1, 1, 1, NULL, 1, '2026-03-09 00:56:35', '2026-03-09 00:56:35'),
(586, 'N/A', '2026-03-09', 592, 1, 1, 1, 1, NULL, 1, '2026-03-09 01:02:10', '2026-03-09 01:02:10'),
(587, 'N/A', '2026-03-09', 593, 1, 1, 1, 1, NULL, 1, '2026-03-09 01:06:22', '2026-03-09 01:06:22'),
(588, 'N/A', '2026-03-09', 594, 1, 1, 1, 1, NULL, 1, '2026-03-09 01:12:22', '2026-03-09 01:12:22'),
(589, 'N/A', '2026-03-09', 595, 1, 1, 1, 1, NULL, 1, '2026-03-09 01:17:16', '2026-03-09 01:17:16'),
(590, 'N/A', '2026-03-09', 596, 1, 1, 1, 1, NULL, 1, '2026-03-09 01:22:01', '2026-03-09 01:22:01'),
(591, 'N/A', '2026-03-10', 597, 1, 11, 5, 1, NULL, 1, '2026-03-09 20:44:52', '2026-03-09 20:44:52'),
(592, 'N/A', '2026-03-10', 598, 1, 11, 5, 1, NULL, 1, '2026-03-09 20:48:42', '2026-03-09 20:48:42'),
(593, 'N/A', '2026-03-10', 599, 1, 11, 5, 1, NULL, 1, '2026-03-09 20:56:09', '2026-03-09 20:56:09'),
(594, 'N/A', '2026-03-10', 600, 1, 11, 5, 1, NULL, 1, '2026-03-09 21:03:53', '2026-03-09 21:03:53'),
(595, 'N/A', '2026-03-10', 601, 1, 11, 5, 1, NULL, 1, '2026-03-09 21:09:05', '2026-03-09 21:09:05'),
(596, 'N/A', '2026-03-10', 602, 1, 11, 5, 1, NULL, 1, '2026-03-09 21:13:53', '2026-03-09 21:13:53'),
(597, 'N/A', '2026-03-10', 603, 1, 11, 5, 1, NULL, 1, '2026-03-09 21:22:12', '2026-03-09 21:22:12'),
(598, 'N/A', '2026-03-10', 604, 1, 6, 3, 1, NULL, 1, '2026-03-09 21:36:10', '2026-03-09 21:36:10'),
(599, 'N/A', '2026-03-10', 605, 1, 6, 3, 1, NULL, 1, '2026-03-09 21:42:06', '2026-03-09 21:42:06'),
(600, 'N/A', '2026-03-10', 606, 1, 7, 3, 1, NULL, 1, '2026-03-09 21:46:01', '2026-03-09 21:46:01'),
(601, 'N/A', '2026-03-10', 607, 1, 5, 3, 1, NULL, 1, '2026-03-09 21:57:12', '2026-03-09 21:57:12'),
(602, 'N/A', '2026-03-11', 608, 1, 6, 3, 1, NULL, 1, '2026-03-10 21:20:28', '2026-03-10 21:20:28'),
(603, 'N/A', '2026-03-11', 609, 1, 6, 3, 1, NULL, 1, '2026-03-10 21:25:21', '2026-03-10 21:25:21'),
(604, 'N/A', '2026-03-11', 610, 1, 5, 3, 1, NULL, 1, '2026-03-10 21:32:13', '2026-03-10 21:32:13'),
(605, 'N/A', '2026-03-11', 611, 1, 5, 3, 1, NULL, 1, '2026-03-10 21:36:13', '2026-03-10 21:36:13'),
(606, 'N/A', '2026-03-11', 612, 1, 5, 3, 1, NULL, 1, '2026-03-10 21:39:46', '2026-03-10 21:39:46'),
(607, 'N/A', '2026-03-11', 613, 1, 5, 3, 1, NULL, 1, '2026-03-10 21:44:43', '2026-03-10 21:44:43'),
(608, 'N/A', '2026-03-11', 614, 1, 5, 3, 1, NULL, 1, '2026-03-10 21:49:44', '2026-03-10 21:49:44'),
(609, 'N/A', '2026-03-11', 615, 1, 14, 6, 1, NULL, 1, '2026-03-11 01:35:57', '2026-03-11 01:35:57'),
(610, 'N/A', '2026-04-12', 616, 1, 13, 6, 1, NULL, 1, '2026-04-11 23:53:03', '2026-04-11 23:53:03'),
(611, 'N/A', '2026-04-12', 617, 1, 8, 4, 1, NULL, 1, '2026-04-11 23:57:19', '2026-04-11 23:57:19'),
(612, 'N/A', '2026-04-12', 618, 1, 8, 4, 1, NULL, 1, '2026-04-12 00:24:38', '2026-04-12 00:24:38'),
(613, 'N/A', '2026-04-12', 619, 1, 2, 2, 1, NULL, 1, '2026-04-12 00:31:32', '2026-04-12 00:31:32'),
(614, 'N/A', '2026-04-12', 620, 1, 2, 2, 1, NULL, 1, '2026-04-12 00:42:08', '2026-04-12 00:42:08');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `religion` varchar(255) NOT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `present_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `nid` varchar(255) DEFAULT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `sms_status` text DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `role` varchar(255) NOT NULL DEFAULT 'users',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `img_url`, `firstName`, `lastName`, `email`, `mobile`, `password`, `otp`, `status`, `role`, `created_at`, `updated_at`) VALUES
(1, 'uploads/user-img/1717418553-icon-5359553_1280.webp', 'John Das', 'Das', 'ywca@gmail.com', '+880 1719-461009', '$2y$10$zN/ITNL5jpZ.nMvU8zBJNu/7qw8/FsaYIKOhbX0BMwAMqfLSXZQ4.', '0', 'approved', 'admin', '2024-06-03 12:42:33', '2024-06-03 12:42:33'),
(2, 'uploads/user-img/1717423695-profile-img.jpg', 'MD:Robiul Islam', 'Robi', 'robi.cnits@gmail.com', '01794123294', '$2y$10$rsDmaqYI2IYru7Z34hF1u.AxPmKYjNLuI86ju1W8.UM3AI8Vbugei', '0', 'approved', 'admin', '2024-06-03 14:08:15', '2024-06-03 14:08:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classes_user_id_foreign` (`user_id`);

--
-- Indexes for table `gradients`
--
ALTER TABLE `gradients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gradients_user_id_foreign` (`user_id`),
  ADD KEY `gradients_student_id_foreign` (`student_id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groups_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sections_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_foreign` (`user_id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shifts_user_id_foreign` (`user_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_email_unique` (`email`),
  ADD KEY `staff_user_id_foreign` (`user_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_email_unique` (`email`),
  ADD KEY `students_user_id_foreign` (`user_id`);

--
-- Indexes for table `student_registrations`
--
ALTER TABLE `student_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_registrations_student_id_foreign` (`student_id`),
  ADD KEY `student_registrations_section_id_foreign` (`section_id`),
  ADD KEY `student_registrations_shift_id_foreign` (`shift_id`),
  ADD KEY `student_registrations_class_id_foreign` (`class_id`),
  ADD KEY `student_registrations_session_id_foreign` (`session_id`),
  ADD KEY `student_registrations_group_id_foreign` (`group_id`),
  ADD KEY `student_registrations_user_id_foreign` (`user_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teachers_email_unique` (`email`),
  ADD KEY `teachers_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `gradients`
--
ALTER TABLE `gradients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=240;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=621;

--
-- AUTO_INCREMENT for table `student_registrations`
--
ALTER TABLE `student_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=615;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `gradients`
--
ALTER TABLE `gradients`
  ADD CONSTRAINT `gradients_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gradients_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `shifts`
--
ALTER TABLE `shifts`
  ADD CONSTRAINT `shifts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `student_registrations`
--
ALTER TABLE `student_registrations`
  ADD CONSTRAINT `student_registrations_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_registrations_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_registrations_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_registrations_session_id_foreign` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_registrations_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_registrations_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

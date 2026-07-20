-- Manual validation fixture for the message_search tokenizer
-- (migrations/0002_fts.sql), per docs/PLANNING.md section 8.8: "The final
-- FTS design should be validated against real kernel symbols, C
-- identifiers, punctuation, file paths, and patch-subject syntax before
-- launch." Run against a local D1 instance:
--
--   wrangler d1 execute lkmlens --local --file tests/fixtures/fts-validation.sql
--
-- and inspect that each MATCH query below returns the expected row.

DELETE FROM message_search WHERE message_id LIKE 'fixture-%';

INSERT INTO message_search (message_id, subject, body_text, author_name, mailing_list, topic_names)
VALUES
  ('fixture-1',
   'sched_ext: improve io_uring latency',
   'This patch touches kernel/bpf/verifier.c and rcu_read_lock() paths.',
   'Alice Kernel', 'bpf', 'eBPF & Networking, Scheduling'),
  ('fixture-2',
   '[PATCH v3 2/5] net: fix XDP redirect for veth',
   'See linux-mm and folio changes for the buffer path.',
   'Bob Hacker', 'netdev', 'eBPF & Networking'),
  ('fixture-3',
   'RFC: CXL memory tiering for NUMA nodes',
   'Discusses PCIe topology and the CXL.mem protocol in detail.',
   'Carol Systems', 'linux-cxl', 'Interconnects & Fabrics, Memory Management');

-- Expect: fixture-1 (underscore kept as a single token).
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"sched_ext"';
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"io_uring"';
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"rcu_read_lock"';

-- Expect: fixture-1 (file-path component matches independently of the path).
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"verifier"';

-- Expect: fixture-2.
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"XDP"';
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"folio"';

-- Expect: fixture-2 (hyphenated compound survives as an adjacency phrase).
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"linux-mm"';

-- Expect: fixture-3.
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"CXL"';
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"NUMA"';
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"PCIe"';

-- Expect: fixture-2 (multi-term implicit AND across subject).
SELECT message_id, subject FROM message_search WHERE message_search MATCH '"XDP" AND "veth"';

DELETE FROM message_search WHERE message_id LIKE 'fixture-%';
